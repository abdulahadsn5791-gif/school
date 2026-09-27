import type { Id } from '../../../value-objects';
import type { EnrollmentAggregate } from '../enrollment.aggregate';

export interface IEnrollmentRepository {
  FindById(id: Id): Promise<EnrollmentAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<EnrollmentAggregate>;
  FindByStudentAndYear(studentId: Id, academicYear: string): Promise<EnrollmentAggregate | null>;
  FindByClass(classId: Id): Promise<EnrollmentAggregate[]>;
  /** Live enrollments across several classes (batched name-index support). */
  FindByClasses(classIds: Id[]): Promise<EnrollmentAggregate[]>;
  FindActiveByStudent(studentId: Id): Promise<EnrollmentAggregate[]>;
  FindByStudent(studentId: Id): Promise<EnrollmentAggregate[]>;
  Save(enrollment: EnrollmentAggregate): Promise<void>;
  Create(enrollment: EnrollmentAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: EnrollmentAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
  /**
   * True when the student/teacher has at least one live enrollment for the given role.
   * Used to guard role changes in UserAppService.
   */
  ExistsRoleEnrollment(userId: Id, role: 'student' | 'teacher'): Promise<boolean>;
}
