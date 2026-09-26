import type {
  CreateNoticeType,
  DeleteNoticeType,
  GetNoticesType,
  NoticeListResponseDto,
  NoticeResponseDto,
  UpdateNoticeType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class NoticeService {
  getNotices(params: GetNoticesType): Promise<NoticeListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.audience) searchParams.set('audience', params.audience);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<NoticeListResponseDto>(`/notices${query ? `?${query}` : ''}`);
  }

  getNoticeById(id: string): Promise<NoticeResponseDto> {
    return http.get<NoticeResponseDto>(`/notices/${id}`);
  }

  createNotice(data: CreateNoticeType): Promise<NoticeResponseDto> {
    return http.post<NoticeResponseDto>('/notices', data);
  }

  updateNotice(data: UpdateNoticeType): Promise<NoticeResponseDto> {
    return http.patch<NoticeResponseDto>('/notices', data);
  }

  deleteNotice(data: DeleteNoticeType): Promise<void> {
    return http.delete<void>('/notices/soft', data);
  }

  recoverNotice(noticeId: string): Promise<NoticeResponseDto> {
    return http.patch<NoticeResponseDto>('/notices/recover', { noticeId });
  }
}

export const noticeService = new NoticeService();
