import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';

export const eventIdDto = z.object({
  eventId: idSchema,
});

export type EventIdType = z.infer<typeof eventIdDto>;

export const deleteEventDto = z.object({
  eventId: idSchema,
  reason: reasonSchema,
});

export type DeleteEventType = z.infer<typeof deleteEventDto>;
