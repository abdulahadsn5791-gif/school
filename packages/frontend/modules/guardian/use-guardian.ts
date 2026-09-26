import {
  type CreateGuardianType,
  createGuardianDto,
  type DeleteGuardianType,
  deleteGuardianDto,
  type GetGuardiansType,
  getGuardiansDto,
  type UpdateGuardianType,
  updateGuardianDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guardianService } from './guardian.service';

export const GUARDIAN_QUERY_KEY = ['guardians'];

export function useGetGuardians(params: GetGuardiansType) {
  return useQuery({
    queryKey: [...GUARDIAN_QUERY_KEY, 'list', params],
    queryFn: () => guardianService.getGuardians(getGuardiansDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetGuardianById(guardianId: string) {
  return useQuery({
    queryKey: [...GUARDIAN_QUERY_KEY, guardianId],
    queryFn: () => guardianService.getGuardianById(guardianId),
    enabled: Boolean(guardianId),
  });
}

function applyGuardianMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: GUARDIAN_QUERY_KEY });
}

export function useCreateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGuardianType) =>
      guardianService.createGuardian(createGuardianDto.parse(data)),
    onSuccess: () => applyGuardianMutationResult(queryClient),
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateGuardianType) =>
      guardianService.updateGuardian(updateGuardianDto.parse(data)),
    onSuccess: () => applyGuardianMutationResult(queryClient),
  });
}

export function useSoftDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteGuardianType) =>
      guardianService.deleteGuardian(deleteGuardianDto.parse(data)),
    onSuccess: () => applyGuardianMutationResult(queryClient),
  });
}

export function useRecoverGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (guardianId: string) => guardianService.recoverGuardian(guardianId),
    onSuccess: () => applyGuardianMutationResult(queryClient),
  });
}
