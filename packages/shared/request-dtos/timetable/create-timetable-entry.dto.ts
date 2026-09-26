import { z } from 'zod';

import { idSchema } from '../../dtos';

export const dayOfWeekSchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]);

export const timetableAcademicYearSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{4}$/, 'Academic year must look like 2026-2027');

export const createTimetableEntryDto = z.object({
  schoolId: idSchema,
  academicYear: timetableAcademicYearSchema,
  classId: idSchema,
  subjectId: idSchema,
  teacherId: idSchema,
  periodId: idSchema,
  dayOfWeek: dayOfWeekSchema,
});

export type CreateTimetableEntryType = z.infer<typeof createTimetableEntryDto>;
