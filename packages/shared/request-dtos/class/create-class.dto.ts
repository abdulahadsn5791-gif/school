import { z } from 'zod';

import { idSchema } from '../../dtos';

export const createClassDto = z.object({
  schoolId: idSchema.optional(),
  /** Human key (new.md §5): the engine derives schoolId from this when sent. */
  schoolCode: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9-]+$/, 'School code may only contain letters, numbers and dashes.')
    .optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Class name is required')
    .max(100, 'Class name cannot exceed 100 characters'),
  grade: z.string().trim().min(1, 'Grade is required').max(20, 'Grade cannot exceed 20 characters'),
  section: z
    .string()
    .trim()
    .min(1, 'Section is required')
    .max(10, 'Section cannot exceed 10 characters'),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, 'Academic year must look like 2026-2027'),
  classTeacherId: idSchema.nullable().optional(),
});

export type CreateClassType = z.infer<typeof createClassDto>;
