import { getAuditLogsDto } from '@ecomerece/shared';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from './audit-log.service';

export const AUDIT_LOG_QUERY_KEY = ['audit-logs'];

export function useGetAuditLogsBySchool(schoolId: string, limit?: number) {
  return useQuery({
    queryKey: [...AUDIT_LOG_QUERY_KEY, 'school', schoolId, limit],
    queryFn: () => {
      getAuditLogsDto.parse({ schoolId, limit });
      return auditLogService.listBySchool(schoolId, limit);
    },
    enabled: Boolean(schoolId),
  });
}

export function useGetAuditLogsByActor(actorId: string, limit?: number) {
  return useQuery({
    queryKey: [...AUDIT_LOG_QUERY_KEY, 'actor', actorId, limit],
    queryFn: () => {
      getAuditLogsDto.parse({ actorId, limit });
      return auditLogService.listByActor(actorId, limit);
    },
    enabled: Boolean(actorId),
  });
}

export function useGetAuditLogsByEntity(entityType: string, entityId: string, limit?: number) {
  return useQuery({
    queryKey: [...AUDIT_LOG_QUERY_KEY, 'entity', entityType, entityId, limit],
    queryFn: () => {
      getAuditLogsDto.parse({ entityType, entityId, limit });
      return auditLogService.listByEntity(entityType, entityId, limit);
    },
    enabled: Boolean(entityType) && Boolean(entityId),
  });
}
