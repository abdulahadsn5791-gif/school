import type { Id, ISchoolRepository, SchoolAggregate } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { SchoolMapper } from './school.mapper';
import { SchoolModel, type SchoolPersistence } from './school.models';

export class SchoolRepository
  extends MongoRepository<SchoolPersistence>
  implements ISchoolRepository
{
  constructor() {
    super(SchoolModel);
  }

  async FindById(id: Id): Promise<SchoolAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return SchoolMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<SchoolAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('School not found.');
    return SchoolMapper.persistenceToAggregate(doc);
  }

  async FindByCode(code: string): Promise<SchoolAggregate | null> {
    const doc = await super.findOne({ code: code.trim().toUpperCase() });
    if (!doc) return null;
    return SchoolMapper.persistenceToAggregate(doc);
  }

  async Save(school: SchoolAggregate): Promise<void> {
    const { _id, ...data } = SchoolMapper.aggregateToPersistence(school);
    await SchoolModel.updateOne({ _id }, { $set: data });
  }

  async Create(school: SchoolAggregate): Promise<void> {
    const doc = new SchoolModel(SchoolMapper.aggregateToPersistence(school));
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
    data: SchoolAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<SchoolPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => SchoolMapper.persistenceToAggregate(doc as SchoolPersistence)),
      meta: result.meta,
    };
  }
}
