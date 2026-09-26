import {
  EnrollmentAggregate,
  type EnrollmentReadModel,
  type IClassRepository,
  Id,
  type IEnrollmentRepository,
  type IEventBus,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateEnrollmentType,
  DeleteEnrollmentType,
  GetEnrollmentsType,
  UpdateEnrollmentType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { EnrollmentMapper } from '../infra/enrollment.mapper';
import { EnrollmentMessages } from '../presentation/enrollment.messages';

export class EnrollmentAppService {
  constructor(
    private readonly enrollmentRepo: IEnrollmentRepository,
    private readonly classRepo: IClassRepository,
    private readonly eventBus: IEventBus,
  ) {}

  private async publishEvents(enrollment: EnrollmentAggregate): Promise<void> {
    const events = enrollment.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createEnrollment(
    data: CreateEnrollmentType,
    actor: { _id: string },
  ): Promise<EnrollmentReadModel> {
    const studentId = Id.create(data.studentId);
    const classId = Id.create(data.classId);

    const clazz = await this.classRepo.FindByIdOrThrow(classId);
    if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');

    // One live enrollment per student per academic year (schema unique index).
    const existing = await this.enrollmentRepo.FindByStudentAndYear(studentId, clazz.academicYear);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('The student is already enrolled for this academic year.');
    }

    const enrollment =
      existing && existing.isDeleted
        ? (existing.recover(), existing.assignClass(classId), existing)
        : EnrollmentAggregate.create({
            id: Id.create(),
            schoolId: clazz.schoolId,
            studentId,
            classId,
            rollNumber: data.rollNumber ?? null,
            academicYear: clazz.academicYear,
          });

    if (data.rollNumber !== undefined) enrollment.assignRollNumber(data.rollNumber);

    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }

  async updateEnrollment(
    data: UpdateEnrollmentType,
    _actor: { _id: string },
  ): Promise<EnrollmentReadModel> {
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

  async softDelete(data: DeleteEnrollmentType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const enrollmentId = Id.create(data.enrollmentId);
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(enrollmentId);
    enrollment.delete(actorId, Reason.create(data.reason));
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMessages.delete(enrollmentId, actorId).message;
  }

  async recover(enrollmentId: string, _actor: { _id: string }): Promise<EnrollmentReadModel> {
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(enrollmentId));
    enrollment.recover();
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }
}
