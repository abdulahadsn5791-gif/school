import { z } from 'zod';
import { optionalAvatarSchema } from '../../dtos';

export const updateAvatarDto = z.object({
  avatar: optionalAvatarSchema,
});

export type UpdateAvatarType = z.infer<typeof updateAvatarDto>;
