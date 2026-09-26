import { z } from 'zod';

import { idSchema } from '../../dtos';

export const createSubjectDto = z.object({
  schoolId: idSchema,
  name: z
    .string()
    .trim()
    .min(3, 'Subject name must be at least 3 characters')
    .max(100, 'Subject name cannot exceed 100 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Subject code must be at least 2 characters')
    .max(30, 'Subject code cannot exceed 30 characters')
    .transform((value) => value.toUpperCase()),
});

export type CreateSubjectType = z.infer<typeof createSubjectDto>;
