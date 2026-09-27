import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { timetableService } from '../timetable/timetable.service';

export const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

/** One resolved timetable cell — ids already replaced with display names. */
export interface TimetableSlot {
  entryId: string;
  dayOfWeek: WeekDay;
  periodId: string;
  periodName: string;
  periodOrder: number;
  startTime: string | null;
  endTime: string | null;
  classId: string;
  className: string;
  subjectName: string;
}

export interface TeacherTimetable {
  /** Slots grouped by day, days in week order, slots by period order. */
  byDay: Array<{ day: WeekDay; slots: TimetableSlot[] }>;
  /** Distinct classes this teacher is timetabled to teach, for the class filter. */
  classes: Array<{ id: string; name: string }>;
  totalSlots: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isTruncated: boolean;
  hasAnyTimetable: boolean;
}

/**
 * The signed-in teacher's whole timetable, resolved into display-ready slots.
 *
 * The engine composes the screen server-side (new.md §6): one request returns
 * slots already joined with period/subject/class names, grouped by day and
 * ordered by period order. The hook maps the DTO to the page's render shape —
 * it joins nothing.
 */
export function useTeacherTimetable(): TeacherTimetable {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';

  const screenQuery = useQuery({
    queryKey: ['timetable', 'screen', 'teacher', teacherId],
    queryFn: () => timetableService.getTeacherTimetableScreen(),
    enabled: Boolean(teacherId),
  });

  const screen = screenQuery.data;
  const byDay = (screen?.byDay ?? []).map((day) => ({
    day: day.day as WeekDay,
    slots: day.slots.map(
      (slot): TimetableSlot => ({
        entryId: slot.entryId,
        dayOfWeek: slot.dayOfWeek as WeekDay,
        periodId: slot.periodId,
        periodName: slot.periodName,
        periodOrder: slot.periodOrder,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classId: slot.classId,
        className: slot.className,
        subjectName: slot.subjectName,
      }),
    ),
  }));

  const totalSlots = screen?.totalSlots ?? 0;

  return {
    byDay,
    classes: screen?.classes ?? [],
    totalSlots,
    isLoading: screenQuery.isLoading,
    isError: screenQuery.isError,
    error: (screenQuery.error as Error | null) ?? null,
    // The engine owns the data; the page renders whatever it sends.
    isTruncated: screen?.isTruncated ?? false,
    hasAnyTimetable: totalSlots > 0,
  };
}
