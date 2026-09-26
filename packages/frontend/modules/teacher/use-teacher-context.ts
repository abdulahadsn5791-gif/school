import type { ClassResponseDto } from '@ecomerece/shared';
import { useAuth } from '../auth/use-auth';
import { useGetClasses } from '../class/use-class';

export const TEACHER_CLASSES_LIMIT = 50;

export interface TeacherContext {
  /** The signed-in teacher's user id — the `teacherId` every self-service filter uses. */
  teacherId: string;
  /**
   * Derived from the teacher's own classes, because the User aggregate has no
   * schoolId. Undefined until a class loads, and permanently undefined for a
   * teacher with no classes assigned — callers must handle that.
   */
  schoolId: string | undefined;
  classes: ClassResponseDto[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasClasses: boolean;
  refetch: () => void;
}

/**
 * Shared context for every teacher portal page: who the teacher is, the classes
 * they teach, and the schoolId that self-service DTOs require.
 *
 * Not a server round trip of its own — it composes the existing class hook.
 */
export function useTeacherContext(): TeacherContext {
  const { user } = useAuth();
  const teacherId = user?.id ?? '';

  const classesQuery = useGetClasses(
    { classTeacherId: teacherId, limit: TEACHER_CLASSES_LIMIT },
    { enabled: Boolean(teacherId) },
  );

  const classes = classesQuery.data?.data ?? [];
  const schoolId = classes[0]?.schoolId;

  return {
    teacherId,
    schoolId,
    classes,
    isLoading: classesQuery.isLoading,
    isError: classesQuery.isError,
    error: (classesQuery.error as Error | null) ?? null,
    hasClasses: classes.length > 0,
    refetch: () => void classesQuery.refetch(),
  };
}
