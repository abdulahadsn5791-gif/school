import type { Id } from '../../../value-objects';
import type { ReportAggregate } from '../report.aggregate';

export interface IReportRepository {
  FindById(id: Id): Promise<ReportAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ReportAggregate>;
  /** Live report of one student for one term (unique pair), if any. */
  FindByStudentAndTerm(studentId: Id, termId: Id): Promise<ReportAggregate | null>;
  /** Live reports of one class for one term. */
  FindByClassAndTerm(schoolId: Id, classId: Id, termId: Id): Promise<ReportAggregate[]>;
  Save(report: ReportAggregate): Promise<void>;
  Create(report: ReportAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ReportAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
