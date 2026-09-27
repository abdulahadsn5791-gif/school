import {
  CalendarEventAggregate,
  type CalendarEventReadModel,
  GetClassSummaryByIdQuery,
  GetSchoolSummaryByIdQuery,
  Id,
  type IEventBus,
  type IEventRepository,
  type IQueryBus,
  Reason,
} from '@ecomerece/domain';
import type {
  CreateEventType,
  DeleteEventType,
  GetEventsType,
  UpdateEventType,
} from '@ecomerece/shared';
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { EventMapper } from '../infra/event.mapper';
import { EventMessages } from '../presentation/event.messages';

export class EventAppService {
  constructor(
    private readonly eventRepo: IEventRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(event: CalendarEventAggregate): Promise<void> {
    const events = event.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createEvent(data: CreateEventType, actor: Actor): Promise<CalendarEventReadModel> {
    actor.assertAdmin();

    const schoolId = Id.create(data.schoolId);
    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');

    const classId = data.classId ? Id.create(data.classId) : null;
    if (classId) {
      const clazz = await this.queryBus.execute(new GetClassSummaryByIdQuery(classId.value));
      if (clazz.isDeleted) throw new ConflictError('This class has been deleted.');
    }

    const event = CalendarEventAggregate.create({
      id: Id.create(),
      schoolId,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      classId,
    });

    await this.eventRepo.Create(event);
    await this.publishEvents(event);
    return EventMapper.aggregateToReadModel(event);
  }

  async updateEvent(data: UpdateEventType, actor: Actor): Promise<CalendarEventReadModel> {
    actor.assertAdmin();

    const event = await this.eventRepo.FindByIdOrThrow(Id.create(data.eventId));
    if (event.isDeleted) throw new NotFoundError('Event not found.');

    if (data.title !== undefined || data.description !== undefined || data.type !== undefined) {
      event.updateDetails(data.title, data.description, data.type);
    }
    if (data.startDate !== undefined && data.endDate !== undefined) {
      event.reschedule(data.startDate, data.endDate);
    }

    await this.eventRepo.Save(event);
    await this.publishEvents(event);
    return EventMapper.aggregateToReadModel(event);
  }

  async getEvent(eventId: string): Promise<CalendarEventReadModel> {
    const event = await this.eventRepo.FindByIdOrThrow(Id.create(eventId));
    return EventMapper.aggregateToReadModel(event);
  }

  async listEvents(query: GetEventsType): Promise<{
    data: CalendarEventReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;
    if (query.classId) filter.classId = query.classId;
    if (query.type) filter.type = query.type;

    const result = await this.eventRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((event) => EventMapper.aggregateToReadModel(event)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeleteEventType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const eventId = Id.create(data.eventId);
    const event = await this.eventRepo.FindByIdOrThrow(eventId);
    event.delete(actorId, Reason.create(data.reason));
    await this.eventRepo.Save(event);
    await this.publishEvents(event);
    return EventMessages.delete(eventId, actorId).message;
  }

  async recover(eventId: string, actor: Actor): Promise<CalendarEventReadModel> {
    actor.assertAdmin();

    const event = await this.eventRepo.FindByIdOrThrow(Id.create(eventId));
    event.recover();
    await this.eventRepo.Save(event);
    await this.publishEvents(event);
    return EventMapper.aggregateToReadModel(event);
  }
}
