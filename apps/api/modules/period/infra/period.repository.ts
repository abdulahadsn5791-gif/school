import type { Id, IPeriodRepository, PeriodAggregate } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { PeriodMapper } from './period.mapper';
import { PeriodModel, type PeriodPersistence } from './period.models';

export class PeriodRepository
  extends MongoRepository<PeriodPersistence>
  implements IPeriodRepository
{
  constructor() {
    super(PeriodModel);
  }

  async FindById(id: Id): Promise<PeriodAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return PeriodMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<PeriodAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Period not found.');
    return PeriodMapper.persistenceToAggregate(doc);
  }

  async FindByIds(ids: Id[]): Promise<PeriodAggregate[]> {
    if (ids.length === 0) return [];
    const docs = await super.find({ _id: { $in: ids.map((id) => id.value) } });
    return docs.map((doc) => PeriodMapper.persistenceToAggregate(doc));
  }

  async FindBySchool(schoolId: Id): Promise<PeriodAggregate[]> {
    const docs = await super.find({ schoolId: schoolId.value });
    return docs.map((doc) => PeriodMapper.persistenceToAggregate(doc));
  }

  async FindBySchoolAndOrder(schoolId: Id, order: number): Promise<PeriodAggregate | null> {
    const doc = await super.findOne({ schoolId: schoolId.value, order });
    if (!doc) return null;
    return PeriodMapper.persistenceToAggregate(doc);
  }

  async Save(period: PeriodAggregate): Promise<void> {
    const { _id, ...data } = PeriodMapper.aggregateToPersistence(period);
    await PeriodModel.updateOne({ _id }, { $set: data });
  }

  async Create(period: PeriodAggregate): Promise<void> {
    const doc = new PeriodModel(PeriodMapper.aggregateToPersistence(period));
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
    data: PeriodAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<PeriodPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => PeriodMapper.persistenceToAggregate(doc as PeriodPersistence)),
      meta: result.meta,
    };
  }
}
