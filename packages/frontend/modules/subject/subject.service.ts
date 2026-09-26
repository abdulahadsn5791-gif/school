import type {
  CreateSubjectType,
  DeleteSubjectType,
  GetSubjectsType,
  SubjectListResponseDto,
  SubjectResponseDto,
  UpdateSubjectType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class SubjectService {
  getSubjects(params: GetSubjectsType): Promise<SubjectListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<SubjectListResponseDto>(`/subjects${query ? `?${query}` : ''}`);
  }

  getSubjectById(id: string): Promise<SubjectResponseDto> {
    return http.get<SubjectResponseDto>(`/subjects/${id}`);
  }

  createSubject(data: CreateSubjectType): Promise<SubjectResponseDto> {
    return http.post<SubjectResponseDto>('/subjects', data);
  }

  updateSubject(data: UpdateSubjectType): Promise<SubjectResponseDto> {
    return http.patch<SubjectResponseDto>('/subjects', data);
  }

  deleteSubject(data: DeleteSubjectType): Promise<void> {
    return http.delete<void>('/subjects/soft', data);
  }

  recoverSubject(subjectId: string): Promise<SubjectResponseDto> {
    return http.patch<SubjectResponseDto>('/subjects/recover', { subjectId });
  }
}

export const subjectService = new SubjectService();
