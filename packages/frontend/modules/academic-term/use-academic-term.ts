import {
  type CreateAcademicTermType,
  createAcademicTermDto,
  type DeleteAcademicTermType,
  deleteAcademicTermDto,
  type GetAcademicTermsType,
  getAcademicTermsDto,
  type UpdateAcademicTermType,
  updateAcademicTermDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academicTermService } from './academic-term.service';

export const ACADEMIC_TERM_QUERY_KEY = ['academic-terms'];

export function useGetAcademicTerms(params: GetAcademicTermsType) {
  return useQuery({
    queryKey: [...ACADEMIC_TERM_QUERY_KEY, 'list', params],
    queryFn: () => academicTermService.getAcademicTerms(getAcademicTermsDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetAcademicTermById(academicTermId: string) {
  return useQuery({
    queryKey: [...ACADEMIC_TERM_QUERY_KEY, academicTermId],
    queryFn: () => academicTermService.getAcademicTermById(academicTermId),
    enabled: Boolean(academicTermId),
  });
}

function applyAcademicTermMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ACADEMIC_TERM_QUERY_KEY });
}

export function useCreateAcademicTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicTermType) =>
      academicTermService.createAcademicTerm(createAcademicTermDto.parse(data)),
    onSuccess: () => applyAcademicTermMutationResult(queryClient),
  });
}

export function useUpdateAcademicTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAcademicTermType) =>
      academicTermService.updateAcademicTerm(updateAcademicTermDto.parse(data)),
    onSuccess: () => applyAcademicTermMutationResult(queryClient),
  });
}

export function useSoftDeleteAcademicTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteAcademicTermType) =>
      academicTermService.deleteAcademicTerm(deleteAcademicTermDto.parse(data)),
    onSuccess: () => applyAcademicTermMutationResult(queryClient),
  });
}

export function useRecoverAcademicTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (academicTermId: string) => academicTermService.recoverAcademicTerm(academicTermId),
    onSuccess: () => applyAcademicTermMutationResult(queryClient),
  });
}
