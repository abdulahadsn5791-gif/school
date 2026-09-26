import { z } from 'zod';

import { idSchema } from '../../dtos';

export const getSubjectsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  search: z.string().trim().optional(),
});

export type GetSubjectsType = z.infer<typeof getSubjectsDto>;
