import type {
  AssignmentListResponseDto,
  AssignmentResponseDto,
  CreateAssignmentType,
  DeleteAssignmentType,
  GetAssignmentsType,
  TeacherAssignmentIndexScreenDto,
  UpdateAssignmentType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class AssignmentService {
  /** Composed screen (new.md §6): the signed-in teacher's assignments, labels resolved. */
  getTeacherAssignmentIndex(): Promise<TeacherAssignmentIndexScreenDto> {
    return http.get<TeacherAssignmentIndexScreenDto>('/assignments/screen/teacher');
  }

  getAssignments(params: GetAssignmentsType): Promise<AssignmentListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.teacherId) searchParams.set('teacherId', params.teacherId);
    if (params.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params.type) searchParams.set('type', params.type);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<AssignmentListResponseDto>(`/assignments${query ? `?${query}` : ''}`);
  }

  getAssignmentById(id: string): Promise<AssignmentResponseDto> {
    return http.get<AssignmentResponseDto>(`/assignments/${id}`);
  }

  createAssignment(data: CreateAssignmentType): Promise<AssignmentResponseDto> {
    return http.post<AssignmentResponseDto>('/assignments', data);
  }

  updateAssignment(data: UpdateAssignmentType): Promise<AssignmentResponseDto> {
    return http.patch<AssignmentResponseDto>('/assignments', data);
  }

  deleteAssignment(data: DeleteAssignmentType): Promise<void> {
    return http.delete<void>('/assignments/soft', data);
  }

  recoverAssignment(assignmentId: string): Promise<AssignmentResponseDto> {
    return http.patch<AssignmentResponseDto>('/assignments/recover', { assignmentId });
  }
}

export const assignmentService = new AssignmentService();
