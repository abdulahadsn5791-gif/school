import { z } from 'zod';
import { BanDaysSchema, idSchema, reasonSchema } from '../../dtos';

export const banUserDto = z.object({
  userId: idSchema,
  days: BanDaysSchema,
  reason: reasonSchema,
});

export type BanUserType = z.infer<typeof banUserDto>;
