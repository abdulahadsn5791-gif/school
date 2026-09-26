import type { Id } from '../../../value-objects';
import type { SchoolAggregate } from '../school.aggregate';

export interface ISchoolRepository {
  FindById(id: Id): Promise<SchoolAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<SchoolAggregate>;
  FindByCode(code: string): Promise<SchoolAggregate | null>;
  Save(school: SchoolAggregate): Promise<void>;
  Create(school: SchoolAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: SchoolAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
