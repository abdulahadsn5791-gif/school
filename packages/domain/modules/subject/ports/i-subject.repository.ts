import type { Id } from '../../../value-objects';
import type { SubjectAggregate } from '../subject.aggregate';

export interface ISubjectRepository {
  FindById(id: Id): Promise<SubjectAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<SubjectAggregate>;
  /** Live subjects among the given ids (batched screen-query support). */
  FindByIds(ids: Id[]): Promise<SubjectAggregate[]>;
  /** Live subject with the given code within a school, if any. */
  FindBySchoolAndCode(schoolId: Id, code: string): Promise<SubjectAggregate | null>;
  Save(subject: SubjectAggregate): Promise<void>;
  Create(subject: SubjectAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: SubjectAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
