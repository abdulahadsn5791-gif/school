import { z } from 'zod';

import { idSchema } from '../../dtos';
import { dayOfWeekSchema, timetableAcademicYearSchema } from './create-timetable-entry.dto';

export const getTimetableEntriesDto = z.object({
  cursor: idSchema.optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  direction: z.enum(['next', 'prev']).optional(),
  schoolId: idSchema.optional(),
  classId: idSchema.optional(),
  teacherId: idSchema.optional(),
  academicYear: timetableAcademicYearSchema.optional(),
  dayOfWeek: dayOfWeekSchema.optional(),
});

export type GetTimetableEntriesType = z.infer<typeof getTimetableEntriesDto>;
