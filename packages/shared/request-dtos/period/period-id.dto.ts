import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { clockTimeSchema } from './create-period.dto';

export const updatePeriodDto = z
  .object({
    periodId: idSchema,
    name: z
      .string()
      .trim()
      .min(1, 'Period name is required')
      .max(100, 'Period name cannot exceed 100 characters')
      .optional(),
    startTime: clockTimeSchema.optional(),
    endTime: clockTimeSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined || (data.startTime !== undefined && data.endTime !== undefined),
    { message: 'Provide a name, or both start and end times' },
  );

export type UpdatePeriodType = z.infer<typeof updatePeriodDto>;

export const periodIdDto = z.object({
  periodId: idSchema,
});

export type PeriodIdType = z.infer<typeof periodIdDto>;

export const deletePeriodDto = z.object({
  periodId: idSchema,
  reason: reasonSchema,
});

export type DeletePeriodType = z.infer<typeof deletePeriodDto>;
