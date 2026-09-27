import type {
  ClassRosterResponseDto,
  CreateEnrollmentType,
  EnrollmentListResponseDto,
  EnrollmentResponseDto,
  GetEnrollmentsType,
  StudentNameIndexEntryDto,
  UpdateEnrollmentType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class EnrollmentService {
  /** Composed screen (new.md §6): batched student names across classes, one request. */
  getStudentNameIndex(classIds: string[]): Promise<StudentNameIndexEntryDto[]> {
    const query = classIds.filter(Boolean).join(',');
    return http.get<StudentNameIndexEntryDto[]>(
      `/enrollments/student-names?classIds=${encodeURIComponent(query)}`,
    );
  }

  getEnrollments(params: GetEnrollmentsType): Promise<EnrollmentListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.studentId) searchParams.set('studentId', params.studentId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<EnrollmentListResponseDto>(`/enrollments${query ? `?${query}` : ''}`);
  }

  getEnrollmentById(id: string): Promise<EnrollmentResponseDto> {
    return http.get<EnrollmentResponseDto>(`/enrollments/${id}`);
  }

  /** Students on a class with names resolved. Teacher-accessible for their own classes. */
  getClassRoster(classId: string): Promise<ClassRosterResponseDto> {
    return http.get<ClassRosterResponseDto>(`/enrollments/roster?classId=${classId}`);
  }

  createEnrollment(data: CreateEnrollmentType): Promise<EnrollmentResponseDto> {
    return http.post<EnrollmentResponseDto>('/enrollments', data);
  }

  updateEnrollment(data: UpdateEnrollmentType): Promise<EnrollmentResponseDto> {
    return http.patch<EnrollmentResponseDto>('/enrollments', data);
  }

  deleteEnrollment(enrollmentId: string, reason: string): Promise<void> {
    return http.delete<void>('/enrollments/soft', { enrollmentId, reason });
  }

  recoverEnrollment(enrollmentId: string): Promise<EnrollmentResponseDto> {
    return http.patch<EnrollmentResponseDto>('/enrollments/recover', { enrollmentId });
  }
}

export const enrollmentService = new EnrollmentService();
