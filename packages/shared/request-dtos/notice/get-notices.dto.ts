import { z } from 'zod';

import { idSchema } from '../../dtos';
import { noticeAudienceSchema } from './create-notice.dto';

export const updateNoticeDto = z
  .object({
    noticeId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Notice title must be at least 3 characters')
      .max(150, 'Notice title cannot exceed 150 characters')
      .optional(),
    body: z
      .string()
      .trim()
      .min(1, 'Notice body is required')
      .max(5000, 'Notice body cannot exceed 5000 characters')
      .optional(),
    audience: noticeAudienceSchema.optional(),
    classId: idSchema.nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    attachments: z.array(z.string().trim().max(300)).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field must be provided to update',
  });

export type UpdateNoticeType = z.infer<typeof updateNoticeDto>;

export const getNoticesDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  audience: noticeAudienceSchema.optional(),
  classId: idSchema.optional(),
});

export type GetNoticesType = z.infer<typeof getNoticesDto>;
