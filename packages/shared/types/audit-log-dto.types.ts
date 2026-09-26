export interface AuditLogResponseDto {
  id: string;
  schoolId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  at: Date;
}
