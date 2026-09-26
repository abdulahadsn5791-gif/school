import { z } from 'zod';

export const createSchoolDto = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'School name must be at least 3 characters')
    .max(150, 'School name cannot exceed 150 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'School code must be at least 2 characters')
    .max(20, 'School code cannot exceed 20 characters')
    .transform((value) => value.toUpperCase()),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email('School email is not valid').optional(),
  logoUrl: z.string().trim().url('School logo URL is not valid').optional(),
  timezone: z.string().trim().max(60).optional(),
});

export type CreateSchoolType = z.infer<typeof createSchoolDto>;
