import { z } from 'zod';

import { idSchema } from '../../dtos';

export const getAuditLogsDto = z.object({
  schoolId: idSchema.optional(),
  actorId: idSchema.optional(),
  entityType: z.string().trim().max(60).optional(),
  entityId: idSchema.optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
});

export type GetAuditLogsType = z.infer<typeof getAuditLogsDto>;

export const auditEntityParamsDto = z.object({
  entityType: z.string().trim().min(1).max(60),
  entityId: idSchema,
});

export type AuditEntityParamsType = z.infer<typeof auditEntityParamsDto>;
