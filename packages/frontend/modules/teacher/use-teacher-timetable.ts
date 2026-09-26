import {
  getTimetableEntriesDto,
  type PeriodResponseDto,
  type TimetableEntryResponseDto,
} from '@ecomerece/shared';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../auth/use-auth';
import { useGetClasses } from '../class/use-class';
import { useGetPeriods } from '../period/use-period';
import { useGetSubjects } from '../subject/use-subject';
import { timetableService, useGetTimetableEntries } from '../timetable';

const PAGE_SIZE = 50;

export const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

/** One resolved timetable cell — ids replaced with display names. */
export interface TimetableSlot {
  entryId: string;
  dayOfWeek: WeekDay;
  periodId: string;
  periodName: string;
  periodOrder: number;
  startTime: string | null;
  endTime: string | null;
  className: string;
  subjectName: string;
}

export interface TeacherTimetable {
  /** Slots grouped by day, days in week order, slots by period order. */
  byDay: Array<{ day: WeekDay; slots: TimetableSlot[] }>;
  totalSlots: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** True when the API has more pages and they have not been fetched yet. */
  isTruncated: boolean;
  isLoadingMore: boolean;
  loadAll: () => void;
  hasAnyTimetable: boolean;
}

/**
 * The signed-in teacher's whole timetable, resolved into display-ready slots.
 *
 * Entries are grouped by day and ordered by period order, and class/subject/period
 * ids are replaced with names. A teacher may teach classes they are not the class
 * teacher of, so class names come from a class list scoped to their school rather
 * than from their own classes.
 */
export function useTeacherTimetable(): TeacherTimetable {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';

  // The school comes from the teacher's own classes; timetable entries inherit it.
  const ownClasses = useGetClasses(
    { classTeacherId: teacherId, limit: PAGE_SIZE },
    { enabled: Boolean(teacherId) },
  );
  const schoolId = ownClasses.data?.data[0]?.schoolId;

  const [extraEntries, setExtraEntries] = useState<TimetableEntryResponseDto[]>([]);
  const [isLoadingMore, setLoadingMore] = useState(false);

  const entriesQuery = useGetTimetableEntries(
    { teacherId, limit: PAGE_SIZE },
    { enabled: Boolean(teacherId) },
  );
  const periodsQuery = useGetPeriods(
    { schoolId, limit: PAGE_SIZE },
    { enabled: Boolean(schoolId) },
  );
  const subjectsQuery = useGetSubjects(
    { schoolId, limit: PAGE_SIZE },
    { enabled: Boolean(schoolId) },
  );
  const schoolClassesQuery = useGetClasses(
    { schoolId, limit: PAGE_SIZE },
    { enabled: Boolean(schoolId) },
  );

  const firstPage = entriesQuery.data;
  const nextCursor = firstPage?.meta.nextCursor ?? null;

  // A refetch that changes the first page invalidates anything we paged in by
  // hand. Adjusting during render (rather than in an effect) avoids briefly
  // rendering stale extra entries against a new first page.
  const pageKey = `${teacherId}:${nextCursor ?? ''}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (lastPageKey !== pageKey) {
    setLastPageKey(pageKey);
    setExtraEntries([]);
  }

  const loadAll = useCallback(async () => {
    let cursor = nextCursor;
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const collected: TimetableEntryResponseDto[] = [];
      let guard = 0;
      while (cursor && guard < 20) {
        guard += 1;
        const page = await timetableService.getEntries(
          getTimetableEntriesDto.parse({ teacherId, cursor, limit: PAGE_SIZE }),
        );
        collected.push(...page.data);
        cursor = page.meta.hasMore ? page.meta.nextCursor : null;
      }
      setExtraEntries(collected);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, teacherId]);

  const periodById = useMemo(() => {
    const map = new Map<string, PeriodResponseDto>();
    for (const period of periodsQuery.data?.data ?? []) map.set(period.id, period);
    return map;
  }, [periodsQuery.data]);

  const subjectById = useMemo(() => {
    const map = new Map<string, string>();
    for (const subject of subjectsQuery.data?.data ?? []) map.set(subject.id, subject.name);
    return map;
  }, [subjectsQuery.data]);

  const classById = useMemo(() => {
    const map = new Map<string, string>();
    for (const clazz of schoolClassesQuery.data?.data ?? []) map.set(clazz.id, clazz.name);
    return map;
  }, [schoolClassesQuery.data]);

  const entries = useMemo(
    () => [...(firstPage?.data ?? []), ...extraEntries],
    [firstPage?.data, extraEntries],
  );

  const byDay = useMemo(() => {
    return WEEK_DAYS.map((day) => {
      const slots = entries
        .filter((entry) => entry.dayOfWeek === day)
        .map((entry) => {
          const period = periodById.get(entry.periodId);
          return {
            entryId: entry.id,
            dayOfWeek: day,
            periodId: entry.periodId,
            periodName: period?.name ?? 'Unnamed period',
            // Unknown periods sort last rather than jumping to order 0.
            periodOrder: period?.order ?? Number.MAX_SAFE_INTEGER,
            startTime: period?.startTime ?? null,
            endTime: period?.endTime ?? null,
            className: classById.get(entry.classId) ?? 'Unknown class',
            subjectName: subjectById.get(entry.subjectId) ?? 'Unknown subject',
          } satisfies TimetableSlot;
        })
        .sort((a, b) => a.periodOrder - b.periodOrder);
      return { day, slots };
    });
  }, [entries, periodById, subjectById, classById]);

  const totalSlots = byDay.reduce((sum, day) => sum + day.slots.length, 0);

  return {
    byDay,
    totalSlots,
    isLoading: entriesQuery.isLoading || ownClasses.isLoading,
    isError: entriesQuery.isError,
    error: (entriesQuery.error as Error | null) ?? null,
    isTruncated: Boolean(firstPage?.meta.hasMore) && extraEntries.length === 0,
    isLoadingMore,
    loadAll: () => void loadAll(),
    hasAnyTimetable: totalSlots > 0,
  };
}
