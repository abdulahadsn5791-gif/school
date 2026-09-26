import { z } from 'zod';

import { idSchema } from '../../dtos';

export const clockTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?$/i, 'Time must look like 08:00 or 08:00 AM');

export const createPeriodDto = z.object({
  schoolId: idSchema,
  name: z
    .string()
    .trim()
    .min(1, 'Period name is required')
    .max(100, 'Period name cannot exceed 100 characters'),
  startTime: clockTimeSchema,
  endTime: clockTimeSchema,
  order: z.coerce.number().int().min(1, 'Order must be at least 1').max(20),
});

export type CreatePeriodType = z.infer<typeof createPeriodDto>;
