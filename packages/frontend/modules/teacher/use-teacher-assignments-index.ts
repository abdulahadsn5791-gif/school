import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '../assignment/assignment.service';
import { useAuth } from '../auth/use-auth';

export interface AssignmentIndexEntry {
  id: string;
  title: string;
  type: 'homework' | 'test' | 'oral';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  totalMarks: number;
  dueDate: Date;
}

export interface TeacherAssignmentsIndex {
  byId: Map<string, AssignmentIndexEntry>;
  all: AssignmentIndexEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** True when the engine capped the scan and the index may be incomplete. */
  isTruncated: boolean;
}

/**
 * Every assignment the signed-in teacher owns, keyed by id, with class and
 * subject names already resolved by the engine (new.md §6: one request, no
 * paging, no client join). Serves the teacher's assignment list and the
 * grading queue; grading needs the assignment total as the mark ceiling, so
 * the engine caps its scan high and reports if it was hit.
 */
export function useTeacherAssignmentsIndex(): TeacherAssignmentsIndex {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';

  const screenQuery = useQuery({
    queryKey: ['assignments', 'screen', 'teacher', teacherId],
    queryFn: () => assignmentService.getTeacherAssignmentIndex(),
    enabled: Boolean(teacherId),
  });

  const all = (screenQuery.data?.entries ?? []).map(
    (entry): AssignmentIndexEntry => ({
      id: entry.id,
      title: entry.title,
      type: entry.type,
      classId: entry.classId,
      className: entry.className,
      subjectId: entry.subjectId,
      subjectName: entry.subjectName,
      totalMarks: entry.totalMarks,
      dueDate: entry.dueDate,
    }),
  );

  const byId = new Map(all.map((entry) => [entry.id, entry]));

  return {
    byId,
    all,
    isLoading: screenQuery.isLoading,
    isError: screenQuery.isError,
    error: (screenQuery.error as Error | null) ?? null,
    isTruncated: screenQuery.data?.isTruncated ?? false,
  };
}
