import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const academicTermIdDto = z.object({
  academicTermId: idSchema,
});

export type AcademicTermIdType = z.infer<typeof academicTermIdDto>;

export const deleteAcademicTermDto = z.object({
  academicTermId: idSchema,
  reason: reasonSchema,
});

export type DeleteAcademicTermType = z.infer<typeof deleteAcademicTermDto>;
