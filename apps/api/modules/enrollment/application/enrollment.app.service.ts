import {
  EnrollmentAggregate,
  type EnrollmentReadModel,
  type IClassRepository,
  Id,
  type IEnrollmentRepository,
  type IEventBus,
  Reason,
} from '@ecomerece/domain';
import type { CreateEnrollmentType, UpdateEnrollmentType } from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { EnrollmentMapper } from '../infra/enrollment.mapper';

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

  async softDelete(enrollmentId: string, actor: { _id: string }, reason: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(enrollmentId));
    enrollment.delete(Id.create(actor._id), Reason.create(reason));
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
  }

  async recover(enrollmentId: string, _actor: { _id: string }): Promise<EnrollmentReadModel> {
    const enrollment = await this.enrollmentRepo.FindByIdOrThrow(Id.create(enrollmentId));
    enrollment.recover();
    await this.enrollmentRepo.Save(enrollment);
    await this.publishEvents(enrollment);
    return EnrollmentMapper.aggregateToReadModel(enrollment);
  }
}
