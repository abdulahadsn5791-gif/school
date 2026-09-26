import type { Id } from '../../../value-objects';
import type { StudentTestAggregate } from '../student-test.aggregate';

export interface IStudentTestRepository {
  FindById(id: Id): Promise<StudentTestAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<StudentTestAggregate>;
  /** Live submission of one student for one assignment (unique pair), if any. */
  FindByAssignmentAndStudent(assignmentId: Id, studentId: Id): Promise<StudentTestAggregate | null>;
  /** Live submissions for one assignment. */
  FindByAssignment(assignmentId: Id): Promise<StudentTestAggregate[]>;
  /** Live submissions of one student. */
  FindByStudent(studentId: Id): Promise<StudentTestAggregate[]>;
  Save(submission: StudentTestAggregate): Promise<void>;
  Create(submission: StudentTestAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: StudentTestAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
