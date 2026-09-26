import type {
  ClassListResponseDto,
  ClassResponseDto,
  CreateClassType,
  DeleteClassType,
  GetClassesType,
  UpdateClassType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class ClassService {
  getClasses(params: GetClassesType): Promise<ClassListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classTeacherId) searchParams.set('classTeacherId', params.classTeacherId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<ClassListResponseDto>(`/classes${query ? `?${query}` : ''}`);
  }

  getClassById(id: string): Promise<ClassResponseDto> {
    return http.get<ClassResponseDto>(`/classes/${id}`);
  }

  createClass(data: CreateClassType): Promise<ClassResponseDto> {
    return http.post<ClassResponseDto>('/classes', data);
  }

  updateClass(data: UpdateClassType): Promise<ClassResponseDto> {
    return http.patch<ClassResponseDto>('/classes', data);
  }

  deleteClass(data: DeleteClassType): Promise<void> {
    return http.delete<void>('/classes/soft', data);
  }

  recoverClass(classId: string): Promise<ClassResponseDto> {
    return http.patch<ClassResponseDto>('/classes/recover', { classId });
  }
}

export const classService = new ClassService();
