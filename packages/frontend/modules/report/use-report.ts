import {
  type CreateReportType,
  createReportDto,
  type DeleteReportType,
  deleteReportDto,
  type GetReportsType,
  getReportsDto,
  type UpdateReportType,
  updateReportDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from './report.service';

export const REPORT_QUERY_KEY = ['reports'];

export function useGetReports(params: GetReportsType) {
  return useQuery({
    queryKey: [...REPORT_QUERY_KEY, 'list', params],
    queryFn: () => reportService.getReports(getReportsDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetReportById(reportId: string) {
  return useQuery({
    queryKey: [...REPORT_QUERY_KEY, reportId],
    queryFn: () => reportService.getReportById(reportId),
    enabled: Boolean(reportId),
  });
}

function applyReportMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: REPORT_QUERY_KEY });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReportType) => reportService.createReport(createReportDto.parse(data)),
    onSuccess: () => applyReportMutationResult(queryClient),
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateReportType) => reportService.updateReport(updateReportDto.parse(data)),
    onSuccess: () => applyReportMutationResult(queryClient),
  });
}

export function useSoftDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteReportType) => reportService.deleteReport(deleteReportDto.parse(data)),
    onSuccess: () => applyReportMutationResult(queryClient),
  });
}
