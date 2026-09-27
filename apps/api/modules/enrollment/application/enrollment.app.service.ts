import {
  type ClassRosterEntryReadModel,
  EnrollmentAggregate,
  type EnrollmentReadModel,
  GetSchoolSummaryByIdQuery,
  GetUserSummariesByIdsQuery,
  type IClassRepository,
  Id,
  type IEnrollmentRepository,
  type IEventBus,
  type IQueryBus,
  Reason,
  type StudentNameIndexEntryReadModel,
} from '@ecomerece/domain';
import type {
  ClassRosterStudentDto,
  CreateEnrollmentType,
  DeleteEnrollmentType,
  GetClassRosterType,
  GetEnrollmentsType,
  UpdateEnrollmentType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { EnrollmentMapper } from '../infra/enrollment.mapper';
import { EnrollmentMessages } from '../presentation/enrollment.messages';

export class EnrollmentAppService {
  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly classRepo: IClassRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(enrollment: EnrollmentAggregate): Promise<void> {
    const events = enrollment.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createEnrollment(data: CreateEnrollmentType, actor: Actor): Promise<EnrollmentReadModel> {
    actor.assertAdmin();

    const studentId = Id.create(data.studentId);
    const classId = Id.create(data.classId);

    const clazz = await this.classRepo.FindByIdOrThrow(classId);
    if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(clazz.schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');

    // One live enrollment per student per academic year (schema unique index).
    const existing = await this.enrollmentRepo.FindByStudentAndYear(studentId, clazz.academicYear);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('The student is already enrolled for this academic year.');
    }

    let enrollment: EnrollmentAggregate;
    if (existing?.isDeleted) {
      existing.recover();
      existing.assignClass(classId);
      enrollment = existing;
    } else {
      enrollment = EnrollmentAggregate.create({
        id: Id.create(),
        schoolId: clazz.schoolId,
        studentId,
        classId,
        rollNumber: data.rollNumber ?? null,
        academicYear: clazz.academicYear,
      });
    }

    if (data.rollNumber !== undefined) enrollment.assignRollNumber(data.rollNumber);

    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }

  async updateEnrollment(data: UpdateEnrollmentType, actor: Actor): Promise<EnrollmentReadModel> {
    actor.assertAdmin();

    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(data.enrollmentId));
    if (enrollment.isDeleted) throw new NotFoundError('Enrollment not found.');

    if (data.classId !== undefined) {
      const clazz = await this.classRepo.FindByIdOrThrow(Id.create(data.classId));
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
      enrollment.assignClass(clazz.id);
    }
    if (data.rollNumber !== undefined) {
      enrollment.assignRollNumber(data.rollNumber);
    }

    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }

  async getEnrollment(enrollmentId: string): Promise<EnrollmentReadModel> {
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(enrollmentId));
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }

  /**
   * Students on a class, with names resolved. Admins may read any roster;
   * teachers only the classes they are the class teacher of. This is the only
   * route that exposes student names to a teacher, so the ownership check is
   * deliberately strict.
   */
  async getClassRoster(data: GetClassRosterType, actor: Actor): Promise<ClassRosterStudentDto[]> {
    const clazz = await this.classRepo.FindByIdOrThrow(Id.create(data.classId));
    if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    if (actor.role !== 'admin' && clazz.classTeacherId?.equals(actor.id) !== true) {
      throw new ForbiddenError('You can only view the roster for your own classes.');
    }
    return this.getRosterForClass(data.classId);
  }

  /**
   * Student names for several classes in ONE batched round trip (new.md §6).
   * A teacher is restricted to classes they own — the same law as the roster
   * route — so ownership is enforced on the WHOLE request before any read.
   */
  async getStudentNameIndex(
    classIds: string[],
    actor: Actor,
  ): Promise<StudentNameIndexEntryReadModel[]> {
    if (classIds.length === 0) return [];

    let allowedIds = classIds;
    if (actor.role !== 'admin') {
      // Restrict the whole request to the caller's own classes up front.
      const owned = await this.classRepo.FindByTeacher(actor.id);
      const ownedIds = new Set(owned.map((clazz) => clazz.id.value));
      allowedIds = classIds.filter((id) => ownedIds.has(id));
      if (allowedIds.length === 0) return [];
    }

    const enrollments = await this.enrollmentRepo.FindByClasses(
      allowedIds.map((id) => Id.create(id)),
    );
    if (enrollments.length === 0) return [];

    const students = await this.queryBus.execute(
      new GetUserSummariesByIdsQuery(enrollments.map((enrollment) => enrollment.studentId.value)),
    );
    const nameByStudentId = new Map(students.map((student) => [student.id, student.fullName]));

    return enrollments.map((enrollment) => ({
      classId: enrollment.classId.value,
      studentId: enrollment.studentId.value,
      fullName: nameByStudentId.get(enrollment.studentId.value) ?? 'Unknown student',
      rollNumber: enrollment.rollNumber,
    }));
  }

  /**
   * The read side behind the roster route AND the cross-module roster query
   * (new.md §6): no actor check here — HTTP callers were checked above, and
   * QueryBus callers (sibling modules like attendance) authorize the class
   * before asking. Batched public-tier name resolution, no N+1.
   */
  async getRosterForClass(classId: string): Promise<ClassRosterEntryReadModel[]> {
    const enrollments = (await this.enrollmentRepo.FindByClass(Id.create(classId))).filter(
      (enrollment) => !enrollment.isDeleted,
    );
    if (enrollments.length === 0) return [];

    const students = await this.queryBus.execute(
      new GetUserSummariesByIdsQuery(enrollments.map((enrollment) => enrollment.studentId.value)),
    );
    const nameByStudentId = new Map(students.map((student) => [student.id, student.fullName]));

    return enrollments
      .map((enrollment) => ({
        studentId: enrollment.studentId.value,
        fullName: nameByStudentId.get(enrollment.studentId.value) ?? 'Unknown student',
        rollNumber: enrollment.rollNumber,
      }))
      .sort((a, b) => {
        if (a.rollNumber && b.rollNumber) return a.rollNumber.localeCompare(b.rollNumber);
        if (a.rollNumber) return -1;
        if (b.rollNumber) return 1;
        return a.fullName.localeCompare(b.fullName);
      });
  }

  async listEnrollments(query: GetEnrollmentsType): Promise<{
    data: EnrollmentReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.studentId) filter.studentId = query.studentId;
    if (query.classId) filter.classId = query.classId;
    if (query.academicYear) filter.academicYear = query.academicYear;

    const result = await this.enrollmentRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((enrollment) => EnrollmentMapper.aggregateToReadModel(enrollment)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteEnrollmentType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const enrollmentId = Id.create(data.enrollmentId);
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(enrollmentId);
    enrollment.delete(actorId, Reason.create(data.reason));
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMessages.delete(enrollmentId, actorId).message;
  }

  async recover(enrollmentId: string, actor: Actor): Promise<EnrollmentReadModel> {
    actor.assertAdmin();

    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(enrollmentId));
    enrollment.recover();
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }
}
