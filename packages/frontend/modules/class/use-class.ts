import {
  type CreateClassType,
  createClassDto,
  type DeleteClassType,
  deleteClassDto,
  type GetClassesType,
  getClassesDto,
  type UpdateClassType,
  updateClassDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classService } from './class.service';

export const CLASS_QUERY_KEY = ['classes'];

export function useGetClasses(params: GetClassesType) {
  return useQuery({
    queryKey: [...CLASS_QUERY_KEY, 'list', params],
    queryFn: () => classService.getClasses(getClassesDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetClassById(classId: string) {
  return useQuery({
    queryKey: [...CLASS_QUERY_KEY, classId],
    queryFn: () => classService.getClassById(classId),
    enabled: Boolean(classId),
  });
}

function applyClassMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEY });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassType) => classService.createClass(createClassDto.parse(data)),
    onSuccess: () => applyClassMutationResult(queryClient),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClassType) => classService.updateClass(updateClassDto.parse(data)),
    onSuccess: () => applyClassMutationResult(queryClient),
  });
}

export function useSoftDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteClassType) => classService.deleteClass(deleteClassDto.parse(data)),
    onSuccess: () => applyClassMutationResult(queryClient),
  });
}

export function useRecoverClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => classService.recoverClass(classId),
    onSuccess: () => applyClassMutationResult(queryClient),
  });
}
