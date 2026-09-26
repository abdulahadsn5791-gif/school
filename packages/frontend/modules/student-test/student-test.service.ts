import type {
  CreateStudentTestType,
  DeleteStudentTestType,
  GetStudentTestsType,
  GradeStudentTestType,
  MarkMissedType,
  StudentTestListResponseDto,
  StudentTestResponseDto,
  SubmitStudentTestType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class StudentTestService {
  getSubmissions(params: GetStudentTestsType): Promise<StudentTestListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.assignmentId) searchParams.set('assignmentId', params.assignmentId);
    if (params.studentId) searchParams.set('studentId', params.studentId);
    if (params.status) searchParams.set('status', params.status);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<StudentTestListResponseDto>(`/student-tests${query ? `?${query}` : ''}`);
  }

  getSubmissionById(id: string): Promise<StudentTestResponseDto> {
    return http.get<StudentTestResponseDto>(`/student-tests/${id}`);
  }

  createSubmission(data: CreateStudentTestType): Promise<StudentTestResponseDto> {
    return http.post<StudentTestResponseDto>('/student-tests', data);
  }

  submitSubmission(data: SubmitStudentTestType): Promise<StudentTestResponseDto> {
    return http.patch<StudentTestResponseDto>('/student-tests/submit', data);
  }

  gradeSubmission(data: GradeStudentTestType): Promise<StudentTestResponseDto> {
    return http.patch<StudentTestResponseDto>('/student-tests/grade', data);
  }

  markMissed(data: MarkMissedType): Promise<StudentTestResponseDto> {
    return http.patch<StudentTestResponseDto>('/student-tests/mark-missed', data);
  }

  deleteSubmission(data: DeleteStudentTestType): Promise<void> {
    return http.delete<void>('/student-tests/soft', data);
  }
}

export const studentTestService = new StudentTestService();
