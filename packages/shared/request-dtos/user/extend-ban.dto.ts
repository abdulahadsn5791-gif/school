import { z } from 'zod';
import { BanDaysSchema, idSchema } from '../../dtos';

export const extendBanDto = z.object({
  userId: idSchema,
  days: BanDaysSchema,
});

export type ExtendBanType = z.infer<typeof extendBanDto>;
