import type { Id } from '../../../value-objects';
import type { CalendarEventAggregate } from '../event.aggregate';

export interface IEventRepository {
  FindById(id: Id): Promise<CalendarEventAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<CalendarEventAggregate>;
  /** Live events of a school (optionally one class), sorted by startDate asc. */
  FindBySchool(schoolId: Id, classId?: Id): Promise<CalendarEventAggregate[]>;
  Save(event: CalendarEventAggregate): Promise<void>;
  Create(event: CalendarEventAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: CalendarEventAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
