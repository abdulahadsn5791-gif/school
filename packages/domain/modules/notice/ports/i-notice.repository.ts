import type { Id } from '../../../value-objects';
import type { NoticeAggregate, NoticeAudience } from '../notice.aggregate';

export interface INoticeRepository {
  FindById(id: Id): Promise<NoticeAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<NoticeAggregate>;
  /** Live notices of a school, optionally filtered by audience. */
  FindBySchool(schoolId: Id, audience?: NoticeAudience): Promise<NoticeAggregate[]>;
  Save(notice: NoticeAggregate): Promise<void>;
  Create(notice: NoticeAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: NoticeAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
