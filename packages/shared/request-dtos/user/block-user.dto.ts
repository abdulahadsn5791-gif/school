import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const blockUserDto = z.object({
  userId: idSchema,
  reason: reasonSchema,
});

export type BlockUserType = z.infer<typeof blockUserDto>;
