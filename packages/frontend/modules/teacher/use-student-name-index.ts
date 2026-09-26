import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ENROLLMENT_QUERY_KEY, enrollmentService } from '../enrollment';

export interface StudentIdentity {
  fullName: string;
  rollNumber: string | null;
}

export interface StudentNameIndex {
  byId: Map<string, StudentIdentity>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Resolves student names for a set of classes in one hook.
 *
 * Submissions and attendance rows carry only a student id, so the display names
 * are joined in from the roster of whichever class each row belongs to. Queries
 * are batched by react-query rather than issued serially, and repeated class ids
 * are deduplicated so a page of rows from one class costs a single request.
 */
export function useStudentNameIndex(classIds: string[]): StudentNameIndex {
  const unique = useMemo(() => [...new Set(classIds.filter(Boolean))].sort(), [classIds]);

  const results = useQueries({
    queries: unique.map((classId) => ({
      // Shares the cache key with useGetClassRoster so the two do not duplicate fetches.
      queryKey: [...ENROLLMENT_QUERY_KEY, 'roster', classId],
      queryFn: () => enrollmentService.getClassRoster(classId),
      enabled: Boolean(classId),
      staleTime: 5 * 60_000,
    })),
  });

  const byId = useMemo(() => {
    const map = new Map<string, StudentIdentity>();
    for (const result of results) {
      const roster = result.data;
      if (!roster) continue;
      for (const student of roster) {
        map.set(student.studentId, {
          fullName: student.fullName,
          rollNumber: student.rollNumber,
        });
      }
    }
    return map;
  }, [results]);

  return {
    byId,
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    error: (results.find((result) => result.error)?.error as Error | undefined) ?? null,
  };
}
