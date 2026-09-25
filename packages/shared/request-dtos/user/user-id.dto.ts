import { z } from 'zod';
import { idSchema } from '../../dtos';

export const getUserByIdDto = z.object({
  id: idSchema,
});

export type GetUserByIdType = z.infer<typeof getUserByIdDto>;
