import type { GuardianAggregate, Id, IGuardianRepository } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { GuardianMapper } from './guardian.mapper';
import { GuardianModel, type GuardianPersistence } from './guardian.models';

export class GuardianRepository
  extends MongoRepository<GuardianPersistence>
  implements IGuardianRepository
{
  constructor() {
    super(GuardianModel);
  }

  async FindById(id: Id): Promise<GuardianAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return GuardianMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<GuardianAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Guardian not found.');
    return GuardianMapper.persistenceToAggregate(doc);
  }

  async FindBySchool(schoolId: Id): Promise<GuardianAggregate[]> {
    const docs = await super.find({ schoolId: schoolId.value });
    return docs.map((doc) => GuardianMapper.persistenceToAggregate(doc));
  }

  async FindByPhone(schoolId: Id, phone: string): Promise<GuardianAggregate | null> {
    const doc = await super.findOne({ schoolId: schoolId.value, phone: phone.trim() });
    if (!doc) return null;
    return GuardianMapper.persistenceToAggregate(doc);
  }

  async Save(guardian: GuardianAggregate): Promise<void> {
    const { _id, ...data } = GuardianMapper.aggregateToPersistence(guardian);
    await GuardianModel.updateOne({ _id }, { $set: data });
  }

  async Create(guardian: GuardianAggregate): Promise<void> {
    const doc = new GuardianModel(GuardianMapper.aggregateToPersistence(guardian));
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
    data: GuardianAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<GuardianPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        GuardianMapper.persistenceToAggregate(doc as GuardianPersistence),
      ),
      meta: result.meta,
    };
  }
}
