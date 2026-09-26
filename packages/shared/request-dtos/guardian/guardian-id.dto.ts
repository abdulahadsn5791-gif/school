import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { personNameSchema } from './create-guardian.dto';

export const updateGuardianDto = z.object({
  guardianId: idSchema,
  name: personNameSchema.optional(),
  phone: z
    .string()
    .trim()
    .min(6, 'Phone must be at least 6 characters')
    .max(20, 'Phone cannot exceed 20 characters')
    .optional(),
  email: z.string().trim().email('Guardian email is not valid').nullable().optional(),
  occupation: z.string().trim().max(100).nullable().optional(),
});

export type UpdateGuardianType = z.infer<typeof updateGuardianDto>;

export const guardianIdDto = z.object({
  guardianId: idSchema,
});

export type GuardianIdType = z.infer<typeof guardianIdDto>;

export const deleteGuardianDto = z.object({
  guardianId: idSchema,
  reason: reasonSchema,
});

export type DeleteGuardianType = z.infer<typeof deleteGuardianDto>;
