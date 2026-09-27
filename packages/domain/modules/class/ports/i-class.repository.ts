import type { Id } from '../../../value-objects';
import type { ClassAggregate } from '../class.aggregate';

export interface IClassRepository {
  FindById(id: Id): Promise<ClassAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ClassAggregate>;
  /** Live classes among the given ids (batched screen-query support). */
  FindByIds(ids: Id[]): Promise<ClassAggregate[]>;
  FindBySchool(schoolId: Id): Promise<ClassAggregate[]>;
  FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<ClassAggregate[]>;
  FindByTeacher(teacherId: Id): Promise<ClassAggregate[]>;
  Save(clazz: ClassAggregate): Promise<void>;
  Create(clazz: ClassAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ClassAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
