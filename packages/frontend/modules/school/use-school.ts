import {
  type CreateSchoolType,
  createSchoolDto,
  type DeleteSchoolType,
  deleteSchoolDto,
  type GetSchoolsType,
  getSchoolsDto,
  type UpdateSchoolType,
  updateSchoolDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolService } from './school.service';

export const SCHOOL_QUERY_KEY = ['schools'];

export function useGetSchools(params: GetSchoolsType) {
  return useQuery({
    queryKey: [...SCHOOL_QUERY_KEY, 'list', params],
    queryFn: () => schoolService.getSchools(getSchoolsDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetSchoolById(schoolId: string) {
  return useQuery({
    queryKey: [...SCHOOL_QUERY_KEY, schoolId],
    queryFn: () => schoolService.getSchoolById(schoolId),
    enabled: Boolean(schoolId),
  });
}

function applySchoolMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: SCHOOL_QUERY_KEY });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolType) => schoolService.createSchool(createSchoolDto.parse(data)),
    onSuccess: () => applySchoolMutationResult(queryClient),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSchoolType) => schoolService.updateSchool(updateSchoolDto.parse(data)),
    onSuccess: () => applySchoolMutationResult(queryClient),
  });
}

export function useSoftDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteSchoolType) => schoolService.deleteSchool(deleteSchoolDto.parse(data)),
    onSuccess: () => applySchoolMutationResult(queryClient),
  });
}

export function useRecoverSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schoolId: string) => schoolService.recoverSchool(schoolId),
    onSuccess: () => applySchoolMutationResult(queryClient),
  });
}
