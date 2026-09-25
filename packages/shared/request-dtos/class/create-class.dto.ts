import { z } from 'zod';

import { idSchema } from '../../dtos';

export const createClassDto = z.object({
  schoolId: idSchema,
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
