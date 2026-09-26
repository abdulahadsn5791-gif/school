import {
  type CreateNoticeType,
  createNoticeDto,
  type DeleteNoticeType,
  deleteNoticeDto,
  type GetNoticesType,
  getNoticesDto,
  type UpdateNoticeType,
  updateNoticeDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noticeService } from './notice.service';

export const NOTICE_QUERY_KEY = ['notices'];

export function useGetNotices(params: GetNoticesType) {
  return useQuery({
    queryKey: [...NOTICE_QUERY_KEY, 'list', params],
    queryFn: () => noticeService.getNotices(getNoticesDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetNoticeById(noticeId: string) {
  return useQuery({
    queryKey: [...NOTICE_QUERY_KEY, noticeId],
    queryFn: () => noticeService.getNoticeById(noticeId),
    enabled: Boolean(noticeId),
  });
}

function applyNoticeMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: NOTICE_QUERY_KEY });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeType) => noticeService.createNotice(createNoticeDto.parse(data)),
    onSuccess: () => applyNoticeMutationResult(queryClient),
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNoticeType) => noticeService.updateNotice(updateNoticeDto.parse(data)),
    onSuccess: () => applyNoticeMutationResult(queryClient),
  });
}

export function useSoftDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteNoticeType) => noticeService.deleteNotice(deleteNoticeDto.parse(data)),
    onSuccess: () => applyNoticeMutationResult(queryClient),
  });
}

export function useRecoverNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeId: string) => noticeService.recoverNotice(noticeId),
    onSuccess: () => applyNoticeMutationResult(queryClient),
  });
}
