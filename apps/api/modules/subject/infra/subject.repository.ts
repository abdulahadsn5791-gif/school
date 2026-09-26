import type { Id, ISubjectRepository, SubjectAggregate } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { SubjectMapper } from './subject.mapper';
import { SubjectModel, type SubjectPersistence } from './subject.models';

export class SubjectRepository
  extends MongoRepository<SubjectPersistence>
  implements ISubjectRepository
{
  constructor() {
    super(SubjectModel);
  }

  async FindById(id: Id): Promise<SubjectAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return SubjectMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<SubjectAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Subject not found.');
    return SubjectMapper.persistenceToAggregate(doc);
  }

  async FindBySchoolAndCode(schoolId: Id, code: string): Promise<SubjectAggregate | null> {
    const doc = await super.findOne({ schoolId: schoolId.value, code: code.trim().toUpperCase() });
    if (!doc) return null;
    return SubjectMapper.persistenceToAggregate(doc);
  }

  async Save(subject: SubjectAggregate): Promise<void> {
    const { _id, ...data } = SubjectMapper.aggregateToPersistence(subject);
    await SubjectModel.updateOne({ _id }, { $set: data });
  }

  async Create(subject: SubjectAggregate): Promise<void> {
    const doc = new SubjectModel(SubjectMapper.aggregateToPersistence(subject));
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
    data: SubjectAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<SubjectPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        SubjectMapper.persistenceToAggregate(doc as SubjectPersistence),
      ),
      meta: result.meta,
    };
  }
}
