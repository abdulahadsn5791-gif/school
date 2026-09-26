import type { Id } from '../../../value-objects';
import type { AcademicTermAggregate } from '../academic-term.aggregate';

export interface IAcademicTermRepository {
  FindById(id: Id): Promise<AcademicTermAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<AcademicTermAggregate>;
  /** Live terms of a school for one academic year. */
  FindBySchoolAndYear(schoolId: Id, academicYear: string): Promise<AcademicTermAggregate[]>;
  /** The live term currently flagged isCurrent for a school+year, if any. */
  FindCurrentBySchoolAndYear(
    schoolId: Id,
    academicYear: string,
  ): Promise<AcademicTermAggregate | null>;
  Save(term: AcademicTermAggregate): Promise<void>;
  Create(term: AcademicTermAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: AcademicTermAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
