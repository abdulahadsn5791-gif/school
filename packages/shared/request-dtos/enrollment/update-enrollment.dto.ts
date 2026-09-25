import { z } from 'zod';

import { idSchema } from '../../dtos';

export const updateEnrollmentDto = z.object({
  enrollmentId: idSchema,
  classId: idSchema.optional(),
  rollNumber: z
    .string()
    .trim()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number cannot exceed 20 characters')
    .nullable()
    .optional(),
});

export type UpdateEnrollmentType = z.infer<typeof updateEnrollmentDto>;
