import {
  GetSchoolByCodeQuery,
  GetSchoolSummaryByIdQuery,
  Id,
  type IEventBus,
  type IPeriodRepository,
  type IQueryBus,
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
import type { Actor } from '../../../core/actor/actor';
import { ConflictError, NotFoundError } from '../../../errors/app-error';
import { PeriodMapper } from '../infra/period.mapper';
import { PeriodMessages } from '../presentation/period.messages';

export class PeriodAppService {
  constructor(
    private readonly periodRepo: IPeriodRepository,
    private readonly eventBus: IEventBus,
    private readonly queryBus: IQueryBus,
  ) {}

  private async publishEvents(period: PeriodAggregate): Promise<void> {
    const events = period.pullEvents();
    if (events.length > 0) await this.eventBus.publish(events);
  }

  async createPeriod(data: CreatePeriodType, actor: Actor): Promise<PeriodReadModel> {
    actor.assertAdmin();

    // Engine resolves the human key first (new.md §5): code or id, exactly one.
    const schoolId = await this.resolveSchool(data);
    const school = await this.queryBus.execute(new GetSchoolSummaryByIdQuery(schoolId.value));
    if (school.isDeleted) throw new ConflictError('This school has been deleted.');

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

  async updatePeriod(data: UpdatePeriodType, actor: Actor): Promise<PeriodReadModel> {
    actor.assertAdmin();

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

  /** Batch read for screen queries (new.md §6). Hidden periods are skipped. */
  async getPeriodsByIds(periodIds: string[]): Promise<PeriodReadModel[]> {
    if (periodIds.length === 0) return [];
    const periods = await this.periodRepo.FindByIds(periodIds.map((id) => Id.create(id)));
    return periods.map((period) => PeriodMapper.aggregateToReadModel(period));
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

  async softDelete(data: DeletePeriodType, actor: Actor): Promise<string> {
    actor.assertAdmin();

    const actorId = actor.id;
    const periodId = Id.create(data.periodId);
    const period = await this.periodRepo.FindByIdOrThrow(periodId);
    period.delete(actorId, Reason.create(data.reason));
    await this.periodRepo.Save(period);
    await this.publishEvents(period);
    return PeriodMessages.delete(periodId, actorId).message;
  }

  async recover(periodId: string, actor: Actor): Promise<PeriodReadModel> {
    actor.assertAdmin();

    const period = await this.periodRepo.FindByIdOrThrow(Id.create(periodId));
    period.recover();
    await this.periodRepo.Save(period);
    await this.publishEvents(period);
    return PeriodMapper.aggregateToReadModel(period);
  }

  /**
   * Code-or-id school resolution (new.md §5), via the school module's QueryBus
   * query. Requires exactly one of schoolId / schoolCode.
   */
  private async resolveSchool(data: { schoolId?: string; schoolCode?: string }): Promise<Id> {
    if (data.schoolId && data.schoolCode) {
      throw new ConflictError('Send either schoolId or schoolCode, not both.');
    }
    if (data.schoolId) return Id.create(data.schoolId);
    if (data.schoolCode) {
      const school = await this.queryBus.execute(new GetSchoolByCodeQuery(data.schoolCode));
      if (!school) {
        throw new NotFoundError(`No school exists with code "${data.schoolCode}".`);
      }
      return Id.create(school.id);
    }
    throw new ConflictError('A schoolId or schoolCode is required.');
  }
}
