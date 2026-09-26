import type {
  CreateGuardianType,
  DeleteGuardianType,
  GetGuardiansType,
  GuardianListResponseDto,
  GuardianResponseDto,
  UpdateGuardianType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class GuardianService {
  getGuardians(params: GetGuardiansType): Promise<GuardianListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<GuardianListResponseDto>(`/guardians${query ? `?${query}` : ''}`);
  }

  getGuardianById(id: string): Promise<GuardianResponseDto> {
    return http.get<GuardianResponseDto>(`/guardians/${id}`);
  }

  createGuardian(data: CreateGuardianType): Promise<GuardianResponseDto> {
    return http.post<GuardianResponseDto>('/guardians', data);
  }

  updateGuardian(data: UpdateGuardianType): Promise<GuardianResponseDto> {
    return http.patch<GuardianResponseDto>('/guardians', data);
  }

  deleteGuardian(data: DeleteGuardianType): Promise<void> {
    return http.delete<void>('/guardians/soft', data);
  }

  recoverGuardian(guardianId: string): Promise<GuardianResponseDto> {
    return http.patch<GuardianResponseDto>('/guardians/recover', { guardianId });
  }
}

export const guardianService = new GuardianService();
