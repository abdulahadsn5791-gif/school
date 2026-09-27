import type { DayOfWeek } from '../timetable.aggregate';

/**
 * One resolved timetable cell — ids already replaced with display names
 * (new.md §6: the engine returns screens, the frontend renders them).
 */
export interface TimetableSlotReadModel {
  entryId: string;
  dayOfWeek: DayOfWeek;
  periodId: string;
  periodName: string;
  periodOrder: number;
  startTime: string | null;
  endTime: string | null;
  classId: string;
  className: string;
  subjectName: string;
}

/** One day of the teacher's week, slots ordered by period order. */
export interface TeacherTimetableDayReadModel {
  day: DayOfWeek;
  slots: TimetableSlotReadModel[];
}

/**
 * The teacher timetable screen (new.md §6) — exactly what the teacher
 * timetable page renders: the signed-in teacher's week, grouped by day, with
 * class/subject/period names already resolved server-side. Replaces the
 * 5-query client join in `use-teacher-timetable`.
 */
export interface TeacherTimetableScreenReadModel {
  schoolId: string | null;
  byDay: TeacherTimetableDayReadModel[];
  /** Distinct classes the teacher is timetabled to teach, name-sorted. */
  classes: Array<{ id: string; name: string }>;
  totalSlots: number;
  /** True when the entry source hit its safety cap and may be incomplete. */
  isTruncated: boolean;
}
