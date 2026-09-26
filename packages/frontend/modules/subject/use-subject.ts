import {
  type CreateSubjectType,
  createSubjectDto,
  type DeleteSubjectType,
  deleteSubjectDto,
  type GetSubjectsType,
  getSubjectsDto,
  type UpdateSubjectType,
  updateSubjectDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subjectService } from './subject.service';

export const SUBJECT_QUERY_KEY = ['subjects'];

export function useGetSubjects(params: GetSubjectsType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...SUBJECT_QUERY_KEY, 'list', params],
    queryFn: () => subjectService.getSubjects(getSubjectsDto.parse(params)),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useGetSubjectById(subjectId: string) {
  return useQuery({
    queryKey: [...SUBJECT_QUERY_KEY, subjectId],
    queryFn: () => subjectService.getSubjectById(subjectId),
    enabled: Boolean(subjectId),
  });
}

function applySubjectMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEY });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectType) =>
      subjectService.createSubject(createSubjectDto.parse(data)),
    onSuccess: () => applySubjectMutationResult(queryClient),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSubjectType) =>
      subjectService.updateSubject(updateSubjectDto.parse(data)),
    onSuccess: () => applySubjectMutationResult(queryClient),
  });
}

export function useSoftDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteSubjectType) =>
      subjectService.deleteSubject(deleteSubjectDto.parse(data)),
    onSuccess: () => applySubjectMutationResult(queryClient),
  });
}

export function useRecoverSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => subjectService.recoverSubject(subjectId),
    onSuccess: () => applySubjectMutationResult(queryClient),
  });
}
