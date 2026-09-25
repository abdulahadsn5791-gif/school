import { z } from 'zod';

import { idSchema } from '../../dtos';

export const createEnrollmentDto = z.object({
  studentId: idSchema,
  classId: idSchema,
  rollNumber: z
    .string()
    .trim()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number cannot exceed 20 characters')
    .optional(),
});

export type CreateEnrollmentType = z.infer<typeof createEnrollmentDto>;
