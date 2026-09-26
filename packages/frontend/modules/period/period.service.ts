import type {
  CreatePeriodType,
  DeletePeriodType,
  GetPeriodsType,
  PeriodListResponseDto,
  PeriodResponseDto,
  UpdatePeriodType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class PeriodService {
  getPeriods(params: GetPeriodsType): Promise<PeriodListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<PeriodListResponseDto>(`/periods${query ? `?${query}` : ''}`);
  }

  getPeriodById(id: string): Promise<PeriodResponseDto> {
    return http.get<PeriodResponseDto>(`/periods/${id}`);
  }

  createPeriod(data: CreatePeriodType): Promise<PeriodResponseDto> {
    return http.post<PeriodResponseDto>('/periods', data);
  }

  updatePeriod(data: UpdatePeriodType): Promise<PeriodResponseDto> {
    return http.patch<PeriodResponseDto>('/periods', data);
  }

  deletePeriod(data: DeletePeriodType): Promise<void> {
    return http.delete<void>('/periods/soft', data);
  }

  recoverPeriod(periodId: string): Promise<PeriodResponseDto> {
    return http.patch<PeriodResponseDto>('/periods/recover', { periodId });
  }
}

export const periodService = new PeriodService();
