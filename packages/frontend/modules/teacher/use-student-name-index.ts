import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { enrollmentService } from '../enrollment/enrollment.service';

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
 * Resolves student names for a set of classes in ONE request (new.md §6).
 *
 * Submissions and attendance rows carry only a student id, so the engine joins
 * the names server-side across all requested classes; the hook just flattens
 * the entries into the map the pages render from.
 */
export function useStudentNameIndex(classIds: string[]): StudentNameIndex {
  // Stable, deduplicated key so an id-order change does not refetch.
  const unique = useMemo(() => [...new Set(classIds.filter(Boolean))].sort(), [classIds]);
  const cacheKey = unique.join(',');

  const query = useQuery({
    queryKey: ['enrollments', 'student-names', cacheKey],
    queryFn: () => enrollmentService.getStudentNameIndex(unique),
    enabled: unique.length > 0,
    staleTime: 5 * 60_000,
  });

  const byId = useMemo(() => {
    const map = new Map<string, StudentIdentity>();
    for (const entry of query.data ?? []) {
      map.set(entry.studentId, {
        fullName: entry.fullName,
        rollNumber: entry.rollNumber,
      });
    }
    return map;
  }, [query.data]);

  return {
    byId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
  };
}
