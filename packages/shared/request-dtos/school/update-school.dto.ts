import { z } from 'zod';

import { idSchema } from '../../dtos';

export const updateSchoolDto = z.object({
  schoolId: idSchema,
  name: z
    .string()
    .trim()
    .min(3, 'School name must be at least 3 characters')
    .max(150, 'School name cannot exceed 150 characters')
    .optional(),
  address: z.string().trim().max(300).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  email: z.string().trim().email('School email is not valid').nullable().optional(),
  logoUrl: z.string().trim().url('School logo URL is not valid').nullable().optional(),
  timezone: z.string().trim().max(60).optional(),
});

export type UpdateSchoolType = z.infer<typeof updateSchoolDto>;
