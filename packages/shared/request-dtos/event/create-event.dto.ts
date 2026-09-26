import { z } from 'zod';

import { idSchema } from '../../dtos';

export const calendarEventTypeSchema = z.enum(['HOLIDAY', 'EXAM', 'MEETING', 'ACTIVITY', 'OTHER']);

export const createEventDto = z
  .object({
    schoolId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Event title must be at least 3 characters')
      .max(150, 'Event title cannot exceed 150 characters'),
    description: z.string().trim().max(1000).optional(),
    type: calendarEventTypeSchema.default('OTHER'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    classId: idSchema.nullable().optional(),
  })
  .refine((data) => data.endDate.getTime() >= data.startDate.getTime(), {
    message: 'Event end date cannot be before the start date',
    path: ['endDate'],
  });

export type CreateEventType = z.infer<typeof createEventDto>;
