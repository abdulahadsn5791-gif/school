import type { Id } from '../../../value-objects';
import type { AssignmentAggregate } from '../assignment.aggregate';

export interface IAssignmentRepository {
  FindById(id: Id): Promise<AssignmentAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<AssignmentAggregate>;
  /** Live assignments of a class (optionally one subject), newest first. */
  FindByClass(schoolId: Id, classId: Id, subjectId?: Id): Promise<AssignmentAggregate[]>;
  /** Live assignments assigned by a teacher (optionally one subject). */
  FindByTeacher(schoolId: Id, teacherId: Id, subjectId?: Id): Promise<AssignmentAggregate[]>;
  Save(assignment: AssignmentAggregate): Promise<void>;
  Create(assignment: AssignmentAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: AssignmentAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
