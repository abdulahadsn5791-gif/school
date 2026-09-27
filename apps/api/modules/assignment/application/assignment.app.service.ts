import {
  AssignmentAggregate,
  type AssignmentReadModel,
  assertRefRole,
  assertSameSchool,
  GetClassesByIdsQuery,
  GetClassSummaryByIdQuery,
  GetSchoolSummaryByIdQuery,
  GetSubjectSummaryByIdQuery,
  GetSubjectsByIdsQuery,
  GetUserSummaryByIdQuery,
  type IAssignmentRepository,
  type IClassRepository,
  Id,
  type IEventBus,
  type IQueryBus,
  Reason,
  type TeacherAssignmentIndexScreenReadModel,
} from '@ecomerece/domain';
import type {
  CreateAssignmentType,
  DeleteAssignmentType,
  GetAssignmentsType,
  UpdateAssignmentType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../errors/app-error';
import { AssignmentMapper } from '../infra/assignment.mapper';
import { AssignmentMessages } from '../presentation/assignment.messages';

/** Safety cap for the screen query's entry scan (one teacher's own work). */
const SCREEN_ENTRY_CAP = 500;

export class AssignmentAppService {
  constructor(
    private readonly assignmentRepo: IAssignmentRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
    private readonly classRepo?: IClassRepository,
  ) {}

  private async publishEvents(assignment: AssignmentAggregate): Promise<void> {
    const events = assignment.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  /**
   * Referential existence + INTEGRITY via the QueryBus (infra.md Step 1 + 2):
   * same-school coherence and a real teacher, on top of existence.
   * The class repo stays optional because teacher self-service ownership checks
   * need the class *aggregate* (its classTeacherId), which a summary cannot carry.
   */
  private async assertRefsExist(
    schoolId: Id,
    classId: Id,
    subjectId: Id,
    teacherId: Id,
  ): Promise<void> {
    const [school, clazz, subject, teacher] = await Promise.all([
      this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value)),
      this.queryBus.execute(new GetClassSummaryByIdQuery(classId.value)),
      this.queryBus.execute(new GetSubjectSummaryByIdQuery(subjectId.value)),
      this.queryBus.execute(new GetUserSummaryByIdQuery(teacherId.value)),
    ]);
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    if (subject.isDeleted) throw new ConflictError('This subject has been deleted.');

    // Domain law (new.md §6): same-school coherence + teacher role.
    assertSameSchool(schoolId, [
      { label: 'Class', schoolId: clazz.schoolId },
      { label: 'Subject', schoolId: subject.schoolId },
    ]);
    assertRefRole('teacher', teacher, 'teacher');
  }

  async createAssignment(data: CreateAssignmentType, actor: Actor): Promise<AssignmentReadModel> {
    const schoolId = Id.create(data.schoolId);
    const classId = Id.create(data.classId);
    const subjectId = Id.create(data.subjectId);
    // Teachers may only create assignments attributed to themselves, so the
    // client-supplied teacherId is ignored for non-admins.
    if (actor.role === 'admin' && !data.teacherId) {
      throw new BadRequestError('teacherId is required when creating an assignment as an admin.');
    }
    const teacherId = actor.role === 'admin' ? Id.create(data.teacherId) : actor.id;

    await this.assertRefsExist(schoolId, classId, subjectId, teacherId);

    if (actor.role !== 'admin' && this.classRepo) {
      const clazz = await this.classRepo.FindByIdOrThrow(classId);
      if (!clazz.classTeacherId?.equals(actor.id)) {
        throw new ForbiddenError('You can only create assignments for your own classes.');
      }
    }

    const assignment = AssignmentAggregate.create({
      id: Id.create(), // server-side IDs only (engine law)
      schoolId,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      classId,
      subjectId,
      teacherId,
      assignedDate: data.assignedDate ?? new Date(),
      dueDate: data.dueDate,
      totalMarks: data.totalMarks ?? 100,
      attachments: data.attachments ?? [],
    });

    await this.assignmentRepo.Create(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  async updateAssignment(data: UpdateAssignmentType, actor: Actor): Promise<AssignmentReadModel> {
    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(data.assignmentId));
    if (assignment.isDeleted) throw new NotFoundError('Assignment not found.');
    if (actor.role !== 'admin' && !assignment.teacherId.equals(actor.id)) {
      throw new ForbiddenError('You can only edit your own assignments.');
    }

    assignment.update(
      data.title,
      data.description,
      data.dueDate,
      data.totalMarks,
      data.attachments,
    );

    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  async getAssignment(assignmentId: string): Promise<AssignmentReadModel> {
    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(assignmentId));
    return AssignmentMapper.aggregateToReadModel(assignment);
  }

  /**
   * The teacher assignment index screen (new.md §6): every live assignment the
   * signed-in teacher owns, with class/subject names resolved server-side in
   * one batched round trip. Replaces the client join and the paged index hook.
   */
  async getTeacherAssignmentIndex(actor: Actor): Promise<TeacherAssignmentIndexScreenReadModel> {
    actor.assertRole('teacher');

    const assignments = await this.assignmentRepo.FindByTeacherAllSchools(
      actor.id,
      SCREEN_ENTRY_CAP,
    );
    if (assignments.length === 0) {
      return { entries: [], isTruncated: false };
    }

    const [classes, subjects] = await Promise.all([
      this.queryBus.execute(
        new GetClassesByIdsQuery([...new Set(assignments.map((a) => a.classId.value))]),
      ),
      this.queryBus.execute(
        new GetSubjectsByIdsQuery([...new Set(assignments.map((a) => a.subjectId.value))]),
      ),
    ]);

    const classNameById = new Map(classes.map((clazz) => [clazz.id, clazz.name]));
    const subjectNameById = new Map(subjects.map((subject) => [subject.id, subject.name]));

    const entries = assignments.map((assignment) => ({
      id: assignment.id.value,
      title: assignment.title.value,
      type: assignment.type,
      classId: assignment.classId.value,
      className: classNameById.get(assignment.classId.value) ?? 'Unknown class',
      subjectId: assignment.subjectId.value,
      subjectName: subjectNameById.get(assignment.subjectId.value) ?? 'Unknown subject',
      assignedDate: assignment.assignedDate,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
    }));

    return { entries, isTruncated: assignments.length >= SCREEN_ENTRY_CAP };
  }

  async listAssignments(
    query: GetAssignmentsType,
    actor?: Actor,
  ): Promise<{
    data: AssignmentReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classId) filter.classId = query.classId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.type) filter.type = query.type;
    // A teacher only ever sees their own assignments, whatever teacherId they ask for.
    if (actor && actor.role !== 'admin') {
      filter.teacherId = actor.id.value;
    } else if (query.teacherId) {
      filter.teacherId = query.teacherId;
    }

    const result = await this.assignmentRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((assignment) => AssignmentMapper.aggregateToReadModel(assignment)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteAssignmentType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const assignmentId = Id.create(data.assignmentId);
    const assignment = await this.assignmentRepo.FindByIdOrThrow(assignmentId);
    assignment.delete(actorId, Reason.create(data.reason));
    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMessages.delete(assignmentId, actorId).message;
  }

  async recover(assignmentId: string, actor: Actor): Promise<AssignmentReadModel> {
    actor.assertAdmin();

    const assignment = await this.assignmentRepo.FindByIdOrThrow(Id.create(assignmentId));
    assignment.recover();
    await this.assignmentRepo.Save(assignment);
    await this.publishEvents(assignment);
    return AssignmentMapper.aggregateToReadModel(assignment);
  }
}
