import type {
  CreateSchoolType,
  DeleteSchoolType,
  GetSchoolsType,
  SchoolListResponseDto,
  SchoolResponseDto,
  UpdateSchoolType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class SchoolService {
  getSchools(params: GetSchoolsType): Promise<SchoolListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<SchoolListResponseDto>(`/schools${query ? `?${query}` : ''}`);
  }

  getSchoolById(id: string): Promise<SchoolResponseDto> {
    return http.get<SchoolResponseDto>(`/schools/${id}`);
  }

  createSchool(data: CreateSchoolType): Promise<SchoolResponseDto> {
    return http.post<SchoolResponseDto>('/schools', data);
  }

  updateSchool(data: UpdateSchoolType): Promise<SchoolResponseDto> {
    return http.patch<SchoolResponseDto>('/schools', data);
  }

  deleteSchool(data: DeleteSchoolType): Promise<void> {
    return http.delete<void>('/schools/soft', data);
  }

  recoverSchool(schoolId: string): Promise<SchoolResponseDto> {
    return http.patch<SchoolResponseDto>('/schools/recover', { schoolId });
  }
}

export const schoolService = new SchoolService();
