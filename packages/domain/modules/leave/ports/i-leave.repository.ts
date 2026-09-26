import type { Id } from '../../../value-objects';
import type { LeaveAggregate, LeaveStatus } from '../leave.aggregate';

export interface ILeaveRepository {
  FindById(id: Id): Promise<LeaveAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<LeaveAggregate>;
  /** Live leave applications of one applicant. */
  FindByApplicant(schoolId: Id, applicantId: Id, status?: LeaveStatus): Promise<LeaveAggregate[]>;
  /** Live leave applications of a school (optionally by status) — for reviewers. */
  FindBySchool(schoolId: Id, status?: LeaveStatus): Promise<LeaveAggregate[]>;
  Save(leave: LeaveAggregate): Promise<void>;
  Create(leave: LeaveAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: LeaveAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
