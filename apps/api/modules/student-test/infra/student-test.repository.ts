import type { Id, IStudentTestRepository, StudentTestAggregate } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { StudentTestMapper } from './student-test.mapper';
import { StudentTestModel, type StudentTestPersistence } from './student-test.models';

export class StudentTestRepository
  extends MongoRepository<StudentTestPersistence>
  implements IStudentTestRepository
{
  constructor() {
    super(StudentTestModel);
  }

  async FindById(id: Id): Promise<StudentTestAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return StudentTestMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<StudentTestAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Submission not found.');
    return StudentTestMapper.persistenceToAggregate(doc);
  }

  async FindByAssignmentAndStudent(
    assignmentId: Id,
    studentId: Id,
  ): Promise<StudentTestAggregate | null> {
    const doc = await super.findOne({
      assignmentId: assignmentId.value,
      studentId: studentId.value,
    });
    if (!doc) return null;
    return StudentTestMapper.persistenceToAggregate(doc);
  }

  async FindByAssignment(assignmentId: Id): Promise<StudentTestAggregate[]> {
    const docs = await super.find({ assignmentId: assignmentId.value });
    return docs.map((doc) => StudentTestMapper.persistenceToAggregate(doc));
  }

  async FindByStudent(studentId: Id): Promise<StudentTestAggregate[]> {
    const docs = await super.find({ studentId: studentId.value });
    return docs.map((doc) => StudentTestMapper.persistenceToAggregate(doc));
  }

  async Save(submission: StudentTestAggregate): Promise<void> {
    const { _id, ...data } = StudentTestMapper.aggregateToPersistence(submission);
    await StudentTestModel.updateOne({ _id }, { $set: data });
  }

  async Create(submission: StudentTestAggregate): Promise<void> {
    const doc = new StudentTestModel(StudentTestMapper.aggregateToPersistence(submission));
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
    data: StudentTestAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<StudentTestPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        StudentTestMapper.persistenceToAggregate(doc as StudentTestPersistence),
      ),
      meta: result.meta,
    };
  }
}
