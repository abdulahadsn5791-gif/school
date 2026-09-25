import { z } from 'zod';
import { BanDaysSchema, idSchema } from '../../dtos';

export const shortenBanDto = z.object({
  userId: idSchema,
  days: BanDaysSchema,
});

export type ShortenBanType = z.infer<typeof shortenBanDto>;
