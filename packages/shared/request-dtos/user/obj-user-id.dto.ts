import { z } from 'zod';
import { idSchema } from '../../dtos';

export const objUserIdDto = z.object({
  userId: idSchema,
});

export type ObjUserIdType = z.infer<typeof objUserIdDto>;
