import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const classIdDto = z.object({
  classId: idSchema,
});

export type ClassIdType = z.infer<typeof classIdDto>;

export const deleteClassDto = z.object({
  classId: idSchema,
  reason: reasonSchema,
});

export type DeleteClassType = z.infer<typeof deleteClassDto>;
