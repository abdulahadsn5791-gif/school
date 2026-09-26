import type {
  AcademicTermListResponseDto,
  AcademicTermResponseDto,
  CreateAcademicTermType,
  DeleteAcademicTermType,
  GetAcademicTermsType,
  UpdateAcademicTermType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class AcademicTermService {
  getAcademicTerms(params: GetAcademicTermsType): Promise<AcademicTermListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<AcademicTermListResponseDto>(`/academic-terms${query ? `?${query}` : ''}`);
  }

  getAcademicTermById(id: string): Promise<AcademicTermResponseDto> {
    return http.get<AcademicTermResponseDto>(`/academic-terms/${id}`);
  }

  createAcademicTerm(data: CreateAcademicTermType): Promise<AcademicTermResponseDto> {
    return http.post<AcademicTermResponseDto>('/academic-terms', data);
  }

  updateAcademicTerm(data: UpdateAcademicTermType): Promise<AcademicTermResponseDto> {
    return http.patch<AcademicTermResponseDto>('/academic-terms', data);
  }

  deleteAcademicTerm(data: DeleteAcademicTermType): Promise<void> {
    return http.delete<void>('/academic-terms/soft', data);
  }

  recoverAcademicTerm(academicTermId: string): Promise<AcademicTermResponseDto> {
    return http.patch<AcademicTermResponseDto>('/academic-terms/recover', { academicTermId });
  }
}

export const academicTermService = new AcademicTermService();
