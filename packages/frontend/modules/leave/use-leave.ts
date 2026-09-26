import {
  type DeleteLeaveType,
  deleteLeaveDto,
  type GetLeavesType,
  getLeavesDto,
  type ReviewLeaveType,
  reviewLeaveDto,
  type SubmitLeaveType,
  submitLeaveDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveService } from './leave.service';

export const LEAVE_QUERY_KEY = ['leaves'];

export function useGetLeaves(params: GetLeavesType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, 'list', params],
    queryFn: () => leaveService.getLeaves(getLeavesDto.parse(params)),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useGetLeaveById(leaveId: string) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEY, leaveId],
    queryFn: () => leaveService.getLeaveById(leaveId),
    enabled: Boolean(leaveId),
  });
}

function applyLeaveMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEY });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitLeaveType) => leaveService.submitLeave(submitLeaveDto.parse(data)),
    onSuccess: () => applyLeaveMutationResult(queryClient),
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewLeaveType) => leaveService.approveLeave(reviewLeaveDto.parse(data)),
    onSuccess: () => applyLeaveMutationResult(queryClient),
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewLeaveType) => leaveService.rejectLeave(reviewLeaveDto.parse(data)),
    onSuccess: () => applyLeaveMutationResult(queryClient),
  });
}

export function useSoftDeleteLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteLeaveType) => leaveService.deleteLeave(deleteLeaveDto.parse(data)),
    onSuccess: () => applyLeaveMutationResult(queryClient),
  });
}
