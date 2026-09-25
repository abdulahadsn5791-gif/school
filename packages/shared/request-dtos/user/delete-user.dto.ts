import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const deleteUserDto = z.object({
  userId: idSchema,
  reason: reasonSchema,
});

export type DeleteUserType = z.infer<typeof deleteUserDto>;
