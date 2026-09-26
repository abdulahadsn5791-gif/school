import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const schoolIdDto = z.object({
  schoolId: idSchema,
});

export type SchoolIdType = z.infer<typeof schoolIdDto>;

export const deleteSchoolDto = z.object({
  schoolId: idSchema,
  reason: reasonSchema,
});

export type DeleteSchoolType = z.infer<typeof deleteSchoolDto>;
