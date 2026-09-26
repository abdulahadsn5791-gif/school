import { z } from 'zod';

import { idSchema, reasonSchema } from '../../dtos';
import { dayOfWeekSchema } from './create-timetable-entry.dto';

export const updateTimetableEntryDto = z.object({
  timetableEntryId: idSchema,
  subjectId: idSchema.optional(),
  teacherId: idSchema.optional(),
  dayOfWeek: dayOfWeekSchema.optional(),
  periodId: idSchema.optional(),
});

export type UpdateTimetableEntryType = z.infer<typeof updateTimetableEntryDto>;

export const timetableEntryIdDto = z.object({
  timetableEntryId: idSchema,
});

export type TimetableEntryIdType = z.infer<typeof timetableEntryIdDto>;

export const deleteTimetableEntryDto = z.object({
  timetableEntryId: idSchema,
  reason: reasonSchema,
});

export type DeleteTimetableEntryType = z.infer<typeof deleteTimetableEntryDto>;
