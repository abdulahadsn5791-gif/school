import type { Id } from '../../../value-objects';
import type { PeriodAggregate } from '../period.aggregate';

export interface IPeriodRepository {
  FindById(id: Id): Promise<PeriodAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<PeriodAggregate>;
  /** Live periods among the given ids (batched screen-query support). */
  FindByIds(ids: Id[]): Promise<PeriodAggregate[]>;
  /** Live periods of a school ordered by their order field (ascending). */
  FindBySchool(schoolId: Id): Promise<PeriodAggregate[]>;
  /** Live period with the given order position within a school, if any. */
  FindBySchoolAndOrder(schoolId: Id, order: number): Promise<PeriodAggregate | null>;
  Save(period: PeriodAggregate): Promise<void>;
  Create(period: PeriodAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: PeriodAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
