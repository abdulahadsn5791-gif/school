import { z } from 'zod';

import { idSchema } from '../../dtos';

export const academicYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{4}$/, 'Academic year must look like 2026-2027');

export const createAcademicTermDto = z
  .object({
    schoolId: idSchema,
    academicYear: academicYearSchema,
    name: z
      .string()
      .trim()
      .min(1, 'Term name is required')
      .max(100, 'Term name cannot exceed 100 characters'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isCurrent: z.boolean().optional(),
  })
  .refine((data) => data.endDate.getTime() > data.startDate.getTime(), {
    message: 'Term end date must be after the start date',
    path: ['endDate'],
  });

export type CreateAcademicTermType = z.infer<typeof createAcademicTermDto>;
