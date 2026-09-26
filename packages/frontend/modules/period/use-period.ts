import {
  type CreatePeriodType,
  createPeriodDto,
  type DeletePeriodType,
  deletePeriodDto,
  type GetPeriodsType,
  getPeriodsDto,
  type UpdatePeriodType,
  updatePeriodDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { periodService } from './period.service';

export const PERIOD_QUERY_KEY = ['periods'];

export function useGetPeriods(params: GetPeriodsType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PERIOD_QUERY_KEY, 'list', params],
    queryFn: () => periodService.getPeriods(getPeriodsDto.parse(params)),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useGetPeriodById(periodId: string) {
  return useQuery({
    queryKey: [...PERIOD_QUERY_KEY, periodId],
    queryFn: () => periodService.getPeriodById(periodId),
    enabled: Boolean(periodId),
  });
}

function applyPeriodMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: PERIOD_QUERY_KEY });
}

export function useCreatePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePeriodType) => periodService.createPeriod(createPeriodDto.parse(data)),
    onSuccess: () => applyPeriodMutationResult(queryClient),
  });
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePeriodType) => periodService.updatePeriod(updatePeriodDto.parse(data)),
    onSuccess: () => applyPeriodMutationResult(queryClient),
  });
}

export function useSoftDeletePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeletePeriodType) => periodService.deletePeriod(deletePeriodDto.parse(data)),
    onSuccess: () => applyPeriodMutationResult(queryClient),
  });
}

export function useRecoverPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => periodService.recoverPeriod(periodId),
    onSuccess: () => applyPeriodMutationResult(queryClient),
  });
}
