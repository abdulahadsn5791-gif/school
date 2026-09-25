import type { Id } from '../../../value-objects';
import type { EnrollmentAggregate } from '../enrollment.aggregate';

export interface IEnrollmentRepository {
  FindById(id: Id): Promise<EnrollmentAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<EnrollmentAggregate>;
  FindByStudentAndYear(studentId: Id, academicYear: string): Promise<EnrollmentAggregate | null>;
  FindByClass(classId: Id): Promise<EnrollmentAggregate[]>;
  FindActiveByStudent(studentId: Id): Promise<EnrollmentAggregate[]>;
  FindByStudent(studentId: Id): Promise<EnrollmentAggregate[]>;
  Save(enrollment: EnrollmentAggregate): Promise<void>;
  Create(enrollment: EnrollmentAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  /**
   * True when the student/teacher has at least one live enrollment for the given role.
   * Used to guard role changes in UserAppService.
   */
  ExistsRoleEnrollment(userId: Id, role: 'student' | 'teacher'): Promise<boolean>;
}
