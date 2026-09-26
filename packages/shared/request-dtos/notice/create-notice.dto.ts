import { z } from 'zod';

import { idSchema } from '../../dtos';

export const noticeAudienceSchema = z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS']);

export const createNoticeDto = z
  .object({
    schoolId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Notice title must be at least 3 characters')
      .max(150, 'Notice title cannot exceed 150 characters'),
    body: z
      .string()
      .trim()
      .min(1, 'Notice body is required')
      .max(5000, 'Notice body cannot exceed 5000 characters'),
    audience: noticeAudienceSchema.default('ALL'),
    classId: idSchema.nullable().optional(),
    publishAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    attachments: z.array(z.string().trim().max(300)).max(10).optional(),
  })
  .refine((data) => data.audience !== 'CLASS' || data.classId != null, {
    message: 'A class must be selected when the audience is CLASS',
    path: ['classId'],
  });

export type CreateNoticeType = z.infer<typeof createNoticeDto>;
