import type { Id, INoticeRepository, NoticeAggregate, NoticeAudience } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { NoticeMapper } from './notice.mapper';
import { NoticeModel, type NoticePersistence } from './notice.models';

export class NoticeRepository
  extends MongoRepository<NoticePersistence>
  implements INoticeRepository
{
  constructor() {
    super(NoticeModel);
  }

  async FindById(id: Id): Promise<NoticeAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return NoticeMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<NoticeAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Notice not found.');
    return NoticeMapper.persistenceToAggregate(doc);
  }

  async FindBySchool(schoolId: Id, audience?: NoticeAudience): Promise<NoticeAggregate[]> {
    const filter: FilterQuery<NoticePersistence> = { schoolId: schoolId.value };
    if (audience) filter.audience = audience;
    const docs = await super.find(filter);
    return docs.map((doc) => NoticeMapper.persistenceToAggregate(doc));
  }

  async Save(notice: NoticeAggregate): Promise<void> {
    const { _id, ...data } = NoticeMapper.aggregateToPersistence(notice);
    await NoticeModel.updateOne({ _id }, { $set: data });
  }

  async Create(notice: NoticeAggregate): Promise<void> {
    const doc = new NoticeModel(NoticeMapper.aggregateToPersistence(notice));
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
    data: NoticeAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<NoticePersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => NoticeMapper.persistenceToAggregate(doc as NoticePersistence)),
      meta: result.meta,
    };
  }
}
