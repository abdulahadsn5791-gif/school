import {
  type CreateStudentTestType,
  createStudentTestDto,
  type DeleteStudentTestType,
  deleteStudentTestDto,
  type GetStudentTestsType,
  type GradeStudentTestType,
  getStudentTestsDto,
  gradeStudentTestDto,
  type MarkMissedType,
  markMissedDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentTestService } from './student-test.service';

export const STUDENT_TEST_QUERY_KEY = ['student-tests'];

export function useGetSubmissions(params: GetStudentTestsType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...STUDENT_TEST_QUERY_KEY, 'list', params],
    queryFn: () => studentTestService.getSubmissions(getStudentTestsDto.parse(params)),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useGetSubmissionById(studentTestId: string) {
  return useQuery({
    queryKey: [...STUDENT_TEST_QUERY_KEY, studentTestId],
    queryFn: () => studentTestService.getSubmissionById(studentTestId),
    enabled: Boolean(studentTestId),
  });
}

function applyStudentTestMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: STUDENT_TEST_QUERY_KEY });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentTestType) =>
      studentTestService.createSubmission(createStudentTestDto.parse(data)),
    onSuccess: () => applyStudentTestMutationResult(queryClient),
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GradeStudentTestType) =>
      studentTestService.gradeSubmission(gradeStudentTestDto.parse(data)),
    onSuccess: () => applyStudentTestMutationResult(queryClient),
  });
}

export function useMarkMissed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkMissedType) => studentTestService.markMissed(markMissedDto.parse(data)),
    onSuccess: () => applyStudentTestMutationResult(queryClient),
  });
}

export function useSoftDeleteSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteStudentTestType) =>
      studentTestService.deleteSubmission(deleteStudentTestDto.parse(data)),
    onSuccess: () => applyStudentTestMutationResult(queryClient),
  });
}
