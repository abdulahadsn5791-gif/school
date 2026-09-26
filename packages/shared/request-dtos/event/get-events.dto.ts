import { z } from 'zod';

import { idSchema } from '../../dtos';
import { calendarEventTypeSchema } from './create-event.dto';

export const updateEventDto = z
  .object({
    eventId: idSchema,
    title: z
      .string()
      .trim()
      .min(3, 'Event title must be at least 3 characters')
      .max(150, 'Event title cannot exceed 150 characters')
      .optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    type: calendarEventTypeSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 1 &&
      (data.startDate === undefined || data.endDate !== undefined) &&
      (data.endDate === undefined || data.startDate !== undefined),
    { message: 'Provide at least one field; rescheduling requires both dates' },
  );

export type UpdateEventType = z.infer<typeof updateEventDto>;

export const getEventsDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  classId: idSchema.optional(),
  type: calendarEventTypeSchema.optional(),
});

export type GetEventsType = z.infer<typeof getEventsDto>;
