import {
  type AssignmentAggregate,
  type IAssignmentRepository,
  Id,
  type IEventBus,
  type ISchoolRepository,
  type IStudentTestRepository,
  type IUserRepository,
  Reason,
  StudentTestAggregate,
  type StudentTestReadModel,
} from '@ecomerece/domain';
import type {
  CreateStudentTestType,
  DeleteStudentTestType,
  GetStudentTestsType,
  GradeStudentTestType,
  MarkMissedType,
  SubmitStudentTestType,
} from '@ecomerece/shared';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../errors/app-error';
import { StudentTestMapper } from '../infra/student-test.mapper';
import { StudentTestMessages } from '../presentation/student-test.messages';

export class StudentTestAppService {
  constructor(
    private readonly studentTestRepo: IStudentTestRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
    private readonly assignmentRepo?: IAssignmentRepository,
    private readonly userRepo?: IUserRepository,
  ) {}

  private async publishEvents(submission: StudentTestAggregate): Promise<void> {
    const events = submission.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  /** Issue a PENDING submission slot for one student on one assignment. */
  async createSubmission(
    data: CreateStudentTestType,
    _actor: { _id: string },
  ): Promise<StudentTestReadModel> {
    const schoolId = Id.create(data.schoolId);
    const assignmentId = Id.create(data.assignmentId);
    const studentId = Id.create(data.studentId);

    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }
    if (this.assignmentRepo) {
      await this.assignmentRepo.FindByIdOrThrow(assignmentId);
    }
    if (this.userRepo) {
      const student = await this.userRepo.FindByIdOrThrow(studentId);
      if (student.deleted.isDeleted) throw new ConflictError('This student is not available.');
    }

    const existing = await this.studentTestRepo.FindByAssignmentAndStudent(assignmentId, studentId);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A submission already exists for this student and assignment.');
    }

    const submission = StudentTestAggregate.create({
      id: Id.create(),
      schoolId,
      assignmentId,
      studentId,
    });

    await this.studentTestRepo.Create(submission);
    await this.publishEvents(submission);
    return StudentTestMapper.aggregateToReadModel(submission);
  }

  async submit(data: SubmitStudentTestType, actor: { _id: string }): Promise<StudentTestReadModel> {
    const submission = await this.studentTestRepo.FindByIdOrThrow(Id.create(data.studentTestId));
    if (submission.isDeleted) throw new NotFoundError('Submission not found.');
    if (!submission.studentId.equals(Id.create(actor._id))) {
      throw new ConflictError('You can only submit your own work.');
    }

    submission.submit(data.submissionText ?? null, data.submissionFiles);

    await this.studentTestRepo.Save(submission);
    await this.publishEvents(submission);
    return StudentTestMapper.aggregateToReadModel(submission);
  }

  /**
   * Grade a submission. Admins may grade anything; teachers may only grade
   * submissions belonging to an assignment they own.
   */
  async grade(
    data: GradeStudentTestType,
    actor: { _id: string; role: string },
  ): Promise<StudentTestReadModel> {
    const submission = await this.studentTestRepo.FindByIdOrThrow(Id.create(data.studentTestId));
    if (submission.isDeleted) throw new NotFoundError('Submission not found.');
    const assignment = await this.assertCanGrade(submission, actor);

    // The aggregate only rejects negative marks, so the assignment's ceiling is
    // enforced here — otherwise a 100-mark assignment can be graded 999999.
    if (assignment && data.marksObtained > assignment.totalMarks) {
      throw new BadRequestError(
        `Marks cannot exceed the assignment total of ${assignment.totalMarks}.`,
      );
    }

    submission.grade(data.marksObtained, data.teacherFeedback ?? null, Id.create(actor._id));

    await this.studentTestRepo.Save(submission);
    await this.publishEvents(submission);
    return StudentTestMapper.aggregateToReadModel(submission);
  }

  async markMissed(
    data: MarkMissedType,
    actor: { _id: string; role: string },
  ): Promise<StudentTestReadModel> {
    const submission = await this.studentTestRepo.FindByIdOrThrow(Id.create(data.studentTestId));
    if (submission.isDeleted) throw new NotFoundError('Submission not found.');
    await this.assertCanGrade(submission, actor);

    submission.markMissed();

    await this.studentTestRepo.Save(submission);
    await this.publishEvents(submission);
    return StudentTestMapper.aggregateToReadModel(submission);
  }

  /**
   * Admins pass; teachers must own the assignment the submission belongs to.
   * Returns the owning assignment so callers can enforce its mark ceiling.
   */
  private async assertCanGrade(
    submission: StudentTestAggregate,
    actor: { _id: string; role: string },
  ): Promise<AssignmentAggregate | null> {
    if (!this.assignmentRepo) return null;

    const assignment = await this.assignmentRepo.FindByIdOrThrow(submission.assignmentId);
    if (actor.role !== 'admin' && !assignment.teacherId.equals(Id.create(actor._id))) {
      throw new ForbiddenError('You can only grade submissions for your own assignments.');
    }
    return assignment;
  }

  async getSubmission(studentTestId: string): Promise<StudentTestReadModel> {
    const submission = await this.studentTestRepo.FindByIdOrThrow(Id.create(studentTestId));
    return StudentTestMapper.aggregateToReadModel(submission);
  }

  async listSubmissions(
    query: GetStudentTestsType,
    actor?: { _id: string; role: string },
  ): Promise<{
    data: StudentTestReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const empty = { nextCursor: null, prevCursor: null, hasMore: false };
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.status) filter.status = query.status;

    // A teacher only ever sees submissions for assignments they own. The assignment
    // ids are resolved server-side rather than trusted from the client.
    if (actor && actor.role !== 'admin') {
      if (!query.schoolId || !this.assignmentRepo) return { data: [], meta: empty };
      const mine = await this.assignmentRepo.FindByTeacher(
        Id.create(query.schoolId),
        Id.create(actor._id),
      );
      const owned = mine.map((assignment) => assignment.id);
      const scoped = query.assignmentId
        ? owned.filter((id) => id.equals(Id.create(query.assignmentId as string)))
        : owned;
      if (scoped.length === 0) return { data: [], meta: empty };
      filter.assignmentId = { $in: scoped.map((id) => id.value) };
    } else if (query.assignmentId) {
      filter.assignmentId = query.assignmentId;
    }

    const result = await this.studentTestRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((submission) => StudentTestMapper.aggregateToReadModel(submission)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteStudentTestType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const submissionId = Id.create(data.studentTestId);
    const submission = await this.studentTestRepo.FindByIdOrThrow(submissionId);
    submission.delete(actorId, Reason.create(data.reason));
    await this.studentTestRepo.Save(submission);
    await this.publishEvents(submission);
    return StudentTestMessages.delete(submissionId, actorId).message;
  }
}
