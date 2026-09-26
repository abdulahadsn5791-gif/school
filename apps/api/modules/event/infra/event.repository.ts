import type { CalendarEventAggregate, Id, IEventRepository } from '@ecomerece/domain';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { NotFoundError } from '../../../errors/app-error';
import { EventMapper } from './event.mapper';
import { CalendarEventModel, type CalendarEventPersistence } from './event.models';

export class EventRepository
  extends MongoRepository<CalendarEventPersistence>
  implements IEventRepository
{
  constructor() {
    super(CalendarEventModel);
  }

  async FindById(id: Id): Promise<CalendarEventAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return EventMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<CalendarEventAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('Event not found.');
    return EventMapper.persistenceToAggregate(doc);
  }

  async FindBySchool(schoolId: Id, classId?: Id): Promise<CalendarEventAggregate[]> {
    const filter: FilterQuery<CalendarEventPersistence> = { schoolId: schoolId.value };
    if (classId) filter.classId = classId.value;
    const docs = await super.find(filter);
    return docs.map((doc) => EventMapper.persistenceToAggregate(doc));
  }

  async Save(event: CalendarEventAggregate): Promise<void> {
    const { _id, ...data } = EventMapper.aggregateToPersistence(event);
    await CalendarEventModel.updateOne({ _id }, { $set: data });
  }

  async Create(event: CalendarEventAggregate): Promise<void> {
    const doc = new CalendarEventModel(EventMapper.aggregateToPersistence(event));
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
    data: CalendarEventAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: (params.filter ?? {}) as FilterQuery<CalendarEventPersistence>,
      cursor: params.cursor?.value,
      limit: params.limit,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) =>
        EventMapper.persistenceToAggregate(doc as CalendarEventPersistence),
      ),
      meta: result.meta,
    };
  }
}
