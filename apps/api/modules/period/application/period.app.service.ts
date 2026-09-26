import {
  Id,
  type IEventBus,
  type IPeriodRepository,
  type ISchoolRepository,
  PeriodAggregate,
  type PeriodReadModel,
  Reason,
} from '@ecomerece/domain';
import type {
  CreatePeriodType,
  DeletePeriodType,
  GetPeriodsType,
  UpdatePeriodType,
} from '@ecomerece/shared';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { PeriodMapper } from '../infra/period.mapper';
import { PeriodMessages } from '../presentation/period.messages';

export class PeriodAppService {
  constructor(
    private readonly periodRepo: IPeriodRepository,
    private readonly eventBus: IEventBus,
    private readonly schoolRepo?: ISchoolRepository,
  ) {}

  private async publishEvents(period: PeriodAggregate): Promise<void> {
    const events = period.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createPeriod(data: CreatePeriodType, _actor: { _id: string }): Promise<PeriodReadModel> {
    const schoolId = Id.create(data.schoolId);
    if (this.schoolRepo) {
      const school = await this.schoolRepo.FindByIdOrThrow(schoolId);
      if (school.isDeleted) throw new ConflictError('This school has been deleted.');
    }

    // One live period per school+order (schema partial unique index).
    const existing = await this.periodRepo.FindBySchoolAndOrder(schoolId, data.order);
    if (existing && !existing.isDeleted) {
      throw new ConflictError('A period with this order already exists for this school.');
    }

    const period = PeriodAggregate.create({
      id: Id.create(),
      schoolId,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      order: data.order,
    });

    await this.periodRepo.Create(period);
    await this.publishEvents(period);
    return PeriodMapper.aggregateToReadModel(period);
  }

  async updatePeriod(data: UpdatePeriodType, _actor: { _id: string }): Promise<PeriodReadModel> {
    const period = await this.periodRepo.FindByIdOrThrow(Id.create(data.periodId));
    if (period.isDeleted) throw new NotFoundError('Period not found.');

    if (data.name !== undefined) period.rename(data.name);
    if (data.startTime !== undefined && data.endTime !== undefined) {
      period.changeTimes(data.startTime, data.endTime);
    }

    await this.periodRepo.Save(period);
    await this.publishEvents(period);
    return PeriodMapper.aggregateToReadModel(period);
  }

  async getPeriod(periodId: string): Promise<PeriodReadModel> {
    const period = await this.periodRepo.FindByIdOrThrow(Id.create(periodId));
    return PeriodMapper.aggregateToReadModel(period);
  }

  async listPeriods(query: GetPeriodsType): Promise<{
    data: PeriodReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const filter: Record<string, unknown> = { 'deleted.deleted': false };
    if (query.schoolId) filter.schoolId = query.schoolId;

    const result = await this.periodRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((period) => PeriodMapper.aggregateToReadModel(period)),
      meta: result.meta,
    };
  }

  async softDelete(data: DeletePeriodType, actor: { _id: string }): Promise<string> {
    const actorId = Id.create(actor._id);
    const periodId = Id.create(data.periodId);
    const period = await this.periodRepo.FindByIdOrThrow(periodId);
    period.delete(actorId, Reason.create(data.reason));
    await this.periodRepo.Save(period);
    await this.publishEvents(period);
    return PeriodMessages.delete(periodId, actorId).message;
  }

  async recover(periodId: string, _actor: { _id: string }): Promise<PeriodReadModel> {
    const period = await this.periodRepo.FindByIdOrThrow(Id.create(periodId));
    period.recover();
    await this.periodRepo.Save(period);
    await this.publishEvents(period);
    return PeriodMapper.aggregateToReadModel(period);
  }
}
