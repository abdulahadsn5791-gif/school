import { z } from 'zod';

import { idSchema } from '../../dtos';

export const updateClassDto = z.object({
  classId: idSchema,
  name: z
    .string()
    .trim()
    .min(1, 'Class name is required')
    .max(100, 'Class name cannot exceed 100 characters')
    .optional(),
  classTeacherId: idSchema.nullable().optional(),
});

export type UpdateClassType = z.infer<typeof updateClassDto>;
