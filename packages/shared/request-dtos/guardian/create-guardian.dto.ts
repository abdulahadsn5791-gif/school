import { z } from 'zod';

import { idSchema } from '../../dtos';

export const personNameSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  middleName: z.string().trim().max(50).optional(),
  lastName: z.string().trim().max(50).optional(),
});

export const createGuardianDto = z.object({
  schoolId: idSchema,
  name: personNameSchema,
  phone: z
    .string()
    .trim()
    .min(6, 'Phone must be at least 6 characters')
    .max(20, 'Phone cannot exceed 20 characters'),
  email: z.string().trim().email('Guardian email is not valid').optional(),
  occupation: z.string().trim().max(100).optional(),
  userId: idSchema.nullable().optional(),
});

export type CreateGuardianType = z.infer<typeof createGuardianDto>;
