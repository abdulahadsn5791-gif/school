import {
  type CreateAssignmentType,
  createAssignmentDto,
  type DeleteAssignmentType,
  deleteAssignmentDto,
  type GetAssignmentsType,
  getAssignmentsDto,
  type UpdateAssignmentType,
  updateAssignmentDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from './assignment.service';

export const ASSIGNMENT_QUERY_KEY = ['assignments'];

export function useGetAssignments(params: GetAssignmentsType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ASSIGNMENT_QUERY_KEY, 'list', params],
    queryFn: () => assignmentService.getAssignments(getAssignmentsDto.parse(params)),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useGetAssignmentById(assignmentId: string) {
  return useQuery({
    queryKey: [...ASSIGNMENT_QUERY_KEY, assignmentId],
    queryFn: () => assignmentService.getAssignmentById(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

function applyAssignmentMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ASSIGNMENT_QUERY_KEY });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignmentType) =>
      assignmentService.createAssignment(createAssignmentDto.parse(data)),
    onSuccess: () => applyAssignmentMutationResult(queryClient),
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAssignmentType) =>
      assignmentService.updateAssignment(updateAssignmentDto.parse(data)),
    onSuccess: () => applyAssignmentMutationResult(queryClient),
  });
}

export function useSoftDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteAssignmentType) =>
      assignmentService.deleteAssignment(deleteAssignmentDto.parse(data)),
    onSuccess: () => applyAssignmentMutationResult(queryClient),
  });
}

export function useRecoverAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => assignmentService.recoverAssignment(assignmentId),
    onSuccess: () => applyAssignmentMutationResult(queryClient),
  });
}
