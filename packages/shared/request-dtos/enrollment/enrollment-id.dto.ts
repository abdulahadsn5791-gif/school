import { z } from 'zod';

import { idSchema } from '../../dtos';

export const enrollmentIdDto = z.object({
  enrollmentId: idSchema,
});

export type EnrollmentIdType = z.infer<typeof enrollmentIdDto>;
