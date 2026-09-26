import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const enrollmentIdDto = z.object({
  enrollmentId: idSchema,
});

export type EnrollmentIdType = z.infer<typeof enrollmentIdDto>;

export const deleteEnrollmentDto = z.object({
  enrollmentId: idSchema,
  reason: reasonSchema,
});

export type DeleteEnrollmentType = z.infer<typeof deleteEnrollmentDto>;
