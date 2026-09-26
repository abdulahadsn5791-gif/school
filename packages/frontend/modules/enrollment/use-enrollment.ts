import {
  type CreateEnrollmentType,
  createEnrollmentDto,
  type DeleteEnrollmentType,
  deleteEnrollmentDto,
  type GetEnrollmentsType,
  getEnrollmentsDto,
  type UpdateEnrollmentType,
  updateEnrollmentDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from './enrollment.service';

export const ENROLLMENT_QUERY_KEY = ['enrollments'];

export function useGetEnrollments(params: GetEnrollmentsType) {
  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEY, 'list', params],
    queryFn: () => enrollmentService.getEnrollments(getEnrollmentsDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetEnrollmentById(enrollmentId: string) {
  return useQuery({
    queryKey: [...ENROLLMENT_QUERY_KEY, enrollmentId],
    queryFn: () => enrollmentService.getEnrollmentById(enrollmentId),
    enabled: Boolean(enrollmentId),
  });
}

function applyEnrollmentMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ENROLLMENT_QUERY_KEY });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEnrollmentType) =>
      enrollmentService.createEnrollment(createEnrollmentDto.parse(data)),
    onSuccess: () => applyEnrollmentMutationResult(queryClient),
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEnrollmentType) =>
      enrollmentService.updateEnrollment(updateEnrollmentDto.parse(data)),
    onSuccess: () => applyEnrollmentMutationResult(queryClient),
  });
}

export function useSoftDeleteEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteEnrollmentType) => {
      const parsed = deleteEnrollmentDto.parse(data);
      return enrollmentService.deleteEnrollment(parsed.enrollmentId, parsed.reason);
    },
    onSuccess: () => applyEnrollmentMutationResult(queryClient),
  });
}

export function useRecoverEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => enrollmentService.recoverEnrollment(enrollmentId),
    onSuccess: () => applyEnrollmentMutationResult(queryClient),
  });
}
