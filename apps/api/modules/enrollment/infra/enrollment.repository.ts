import type { EnrollmentAggregate, Id, IEnrollmentRepository } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { EnrollmentMapper } from './enrollment.mapper';
import { StudentEnrollmentModel, type StudentEnrollmentPersistence } from './enrollment.models';

export class EnrollmentRepository
  extends MongoRepository<StudentEnrollmentPersistence>
  implements IEnrollmentRepository
{
  constructor() {
    super(StudentEnrollmentModel);
  }

  async FindById(id: Id): Promise<EnrollmentAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return EnrollmentMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<EnrollmentAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Enrollment not found.');
    return EnrollmentMapper.persistenceToAggregate(doc);
  }

  async FindByStudentAndYear(
    studentId: Id,
    academicYear: string,
  ): Promise<EnrollmentAggregate | null> {
    const doc = await super.findOne({ studentId: studentId.value, academicYear });
    if (!doc) return null;
    return EnrollmentMapper.persistenceToAggregate(doc);
  }

  async FindByClass(classId: Id): Promise<EnrollmentAggregate[]> {
    const docs = await super.find({ classId: classId.value });
    return docs.map((doc) => EnrollmentMapper.persistenceToAggregate(doc));
  }

  async FindByStudent(studentId: Id): Promise<EnrollmentAggregate[]> {
    const docs = await super.find({ studentId: studentId.value });
    return docs.map((doc) => EnrollmentMapper.persistenceToAggregate(doc));
  }

  async FindActiveByStudent(studentId: Id): Promise<EnrollmentAggregate[]> {
    const docs = await super.find({ studentId: studentId.value, 'deleted.deleted': false });
    return docs.map((doc) => EnrollmentMapper.persistenceToAggregate(doc));
  }

  async Save(enrollment: EnrollmentAggregate): Promise<void> {
    const { _id, ...data } = EnrollmentMapper.aggregateToPersistence(enrollment);
    await StudentEnrollmentModel.updateOne({ _id }, { $set: data });
  }

  async Create(enrollment: EnrollmentAggregate): Promise<void> {
    const doc = new StudentEnrollmentModel(EnrollmentMapper.aggregateToPersistence(enrollment));
    await doc.save({ session: this.session });
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: EnrollmentAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<StudentEnrollmentPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        EnrollmentMapper.persistenceToAggregate(doc as StudentEnrollmentPersistence),
      ),
      meta: result.meta,
    };
  }

  async ExistsRoleEnrollment(userId: Id, role: 'student' | 'teacher'): Promise<boolean> {
    const filter: FilterQuery<StudentEnrollmentPersistence> =
      role === 'student'
        ? { studentId: userId.value, 'deleted.deleted': false }
        : { 'deleted.deleted': false, classId: { $exists: false } };
    return !!(await StudentEnrollmentModel.exists(filter).session(this.session ?? null));
  }
}
