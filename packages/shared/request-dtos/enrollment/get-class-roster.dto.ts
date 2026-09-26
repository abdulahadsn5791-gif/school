import { z } from 'zod';

import { idSchema } from '../../dtos';

export const getClassRosterDto = z.object({
  classId: idSchema,
});

export type GetClassRosterType = z.infer<typeof getClassRosterDto>;
