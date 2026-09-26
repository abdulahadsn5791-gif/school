import { z } from 'zod';

import { idSchema } from '../../dtos';

export const issueSessionDto = z.object({
  userId: idSchema,
  tokenHash: z
    .string()
    .trim()
    .min(16, 'Token hash is missing or too short')
    .max(256, 'Token hash cannot exceed 256 characters'),
  userAgent: z.string().trim().max(300).nullable().optional(),
  ip: z.string().trim().max(64).nullable().optional(),
  expiresAt: z.coerce.date(),
});

export type IssueSessionType = z.infer<typeof issueSessionDto>;

export const sessionIdDto = z.object({
  sessionId: idSchema,
});

export type SessionIdType = z.infer<typeof sessionIdDto>;

export const getSessionsDto = z.object({
  userId: idSchema,
});

export type GetSessionsType = z.infer<typeof getSessionsDto>;
