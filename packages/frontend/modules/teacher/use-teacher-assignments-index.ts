import { getAssignmentsDto } from '@ecomerece/shared';
import { useCallback, useMemo, useState } from 'react';
import { assignmentService, useGetAssignments } from '../assignment';
import { useTeacherContext } from './use-teacher-context';

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

export interface AssignmentIndexEntry {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  totalMarks: number;
  dueDate: Date;
}

export interface TeacherAssignmentsIndex {
  byId: Map<string, AssignmentIndexEntry>;
  all: AssignmentIndexEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** True when more than one page of assignments exists and the rest is not loaded. */
  isTruncated: boolean;
  loadAll: () => void;
  isLoadingMore: boolean;
}

/**
 * Every assignment the teacher owns, keyed by id.
 *
 * The list endpoint caps `limit` at 50, so this pages through the remainder
 * on demand. Grading needs the assignment total as the mark ceiling, and a
 * silently truncated index would make older work ungradable.
 */
export function useTeacherAssignmentsIndex(): TeacherAssignmentsIndex {
  const { schoolId, teacherId } = useTeacherContext();
  const [extra, setExtra] = useState<AssignmentIndexEntry[]>([]);
  const [isLoadingMore, setLoadingMore] = useState(false);

  const page = useGetAssignments(
    { schoolId, teacherId, limit: PAGE_SIZE },
    { enabled: Boolean(schoolId) && Boolean(teacherId) },
  );
  const nextCursor = page.data?.meta.nextCursor ?? null;

  // A new first page (refetch, or a different teacher) invalidates paged-in extras.
  const pageKey = `${schoolId ?? ''}:${teacherId}:${nextCursor ?? ''}`;
  const [lastPageKey, setLastPageKey] = useState(pageKey);
  if (lastPageKey !== pageKey) {
    setLastPageKey(pageKey);
    setExtra([]);
  }

  const loadAll = useCallback(async () => {
    let cursor = nextCursor;
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const collected: AssignmentIndexEntry[] = [];
      let guard = 0;
      while (cursor && guard < MAX_PAGES) {
        guard += 1;
        const response = await assignmentService.getAssignments(
          getAssignmentsDto.parse({ schoolId, teacherId, cursor, limit: PAGE_SIZE }),
        );
        collected.push(
          ...response.data.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            classId: assignment.classId,
            subjectId: assignment.subjectId,
            totalMarks: assignment.totalMarks,
            dueDate: assignment.dueDate,
          })),
        );
        cursor = response.meta.hasMore ? response.meta.nextCursor : null;
      }
      setExtra((prev) => [...prev, ...collected]);
    } finally {
      setLoadingMore(false);
    }
  }, [schoolId, teacherId, nextCursor]);

  const all = useMemo<AssignmentIndexEntry[]>(() => {
    const first = (page.data?.data ?? []).map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      totalMarks: assignment.totalMarks,
      dueDate: assignment.dueDate,
    }));
    return [...first, ...extra];
  }, [page.data, extra]);

  const byId = useMemo(() => {
    const map = new Map<string, AssignmentIndexEntry>();
    for (const entry of all) map.set(entry.id, entry);
    return map;
  }, [all]);

  return {
    byId,
    all,
    isLoading: page.isLoading,
    isError: page.isError,
    error: (page.error as Error | null) ?? null,
    isTruncated: Boolean(nextCursor) && extra.length === 0,
    loadAll,
    isLoadingMore,
  };
}
