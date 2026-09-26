import type { AuditLogResponseDto } from '@ecomerece/shared';
import { http } from '../../lib';

export class AuditLogService {
  listBySchool(schoolId: string, limit?: number): Promise<AuditLogResponseDto[]> {
    const query = limit ? `&limit=${limit}` : '';
    return http.get<AuditLogResponseDto[]>(
      `/audit-logs/school?schoolId=${encodeURIComponent(schoolId)}${query}`,
    );
  }

  listByActor(actorId: string, limit?: number): Promise<AuditLogResponseDto[]> {
    const query = limit ? `&limit=${limit}` : '';
    return http.get<AuditLogResponseDto[]>(
      `/audit-logs/actor?actorId=${encodeURIComponent(actorId)}${query}`,
    );
  }

  listByEntity(
    entityType: string,
    entityId: string,
    limit?: number,
  ): Promise<AuditLogResponseDto[]> {
    const query = limit ? `?limit=${limit}` : '';
    return http.get<AuditLogResponseDto[]>(
      `/audit-logs/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}${query}`,
    );
  }
}

export const auditLogService = new AuditLogService();
