import { z } from 'zod';

import { idSchema } from '../../dtos';
import { academicYearSchema } from './create-academic-term.dto';

export const updateAcademicTermDto = z
  .object({
    academicTermId: idSchema,
    name: z
      .string()
      .trim()
      .min(1, 'Term name is required')
      .max(100, 'Term name cannot exceed 100 characters')
      .optional(),
    isCurrent: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field must be provided to update',
  });

export type UpdateAcademicTermType = z.infer<typeof updateAcademicTermDto>;

export const getAcademicTermsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  academicYear: academicYearSchema.optional(),
});

export type GetAcademicTermsType = z.infer<typeof getAcademicTermsDto>;
