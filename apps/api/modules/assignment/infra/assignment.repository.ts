import type { AssignmentAggregate, IAssignmentRepository, Id } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { AssignmentMapper } from './assignment.mapper';
import { AssignmentModel, type AssignmentPersistence } from './assignment.models';

export class AssignmentRepository
  extends MongoRepository<AssignmentPersistence>
  implements IAssignmentRepository
{
  constructor() {
    super(AssignmentModel);
  }

  async FindById(id: Id): Promise<AssignmentAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return AssignmentMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<AssignmentAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Assignment not found.');
    return AssignmentMapper.persistenceToAggregate(doc);
  }

  async FindByClass(schoolId: Id, classId: Id, subjectId?: Id): Promise<AssignmentAggregate[]> {
    const filter: FilterQuery<AssignmentPersistence> = {
      schoolId: schoolId.value,
      classId: classId.value,
    };
    if (subjectId) filter.subjectId = subjectId.value;
    const docs = await super.find(filter);
    return docs.map((doc) => AssignmentMapper.persistenceToAggregate(doc));
  }

  async FindByTeacher(schoolId: Id, teacherId: Id, subjectId?: Id): Promise<AssignmentAggregate[]> {
    const filter: FilterQuery<AssignmentPersistence> = {
      schoolId: schoolId.value,
      teacherId: teacherId.value,
    };
    if (subjectId) filter.subjectId = subjectId.value;
    const docs = await super.find(filter);
    return docs.map((doc) => AssignmentMapper.persistenceToAggregate(doc));
  }

  async FindByTeacherAllSchools(teacherId: Id, limit?: number): Promise<AssignmentAggregate[]> {
    const query = this.model
      .find({
        teacherId: teacherId.value,
        'deleted.deleted': false,
      })
      .sort({ dueDate: -1, _id: -1 })
      .session(this.session ?? null)
      .lean();
    if (limit !== undefined) query.limit(limit);
    const docs = (await query) as AssignmentPersistence[];
    return docs.map((doc) => AssignmentMapper.persistenceToAggregate(doc));
  }

  async Save(assignment: AssignmentAggregate): Promise<void> {
    const { _id, ...data } = AssignmentMapper.aggregateToPersistence(assignment);
    await AssignmentModel.updateOne({ _id }, { $set: data });
  }

  async Create(assignment: AssignmentAggregate): Promise<void> {
    const doc = new AssignmentModel(AssignmentMapper.aggregateToPersistence(assignment));
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
    data: AssignmentAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<AssignmentPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        AssignmentMapper.persistenceToAggregate(doc as AssignmentPersistence),
      ),
      meta: result.meta,
    };
  }
}
