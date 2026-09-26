import type {
  DeleteLeaveType,
  GetLeavesType,
  LeaveListResponseDto,
  LeaveResponseDto,
  ReviewLeaveType,
  SubmitLeaveType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class LeaveService {
  getLeaves(params: GetLeavesType): Promise<LeaveListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.applicantId) searchParams.set('applicantId', params.applicantId);
    if (params.status) searchParams.set('status', params.status);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<LeaveListResponseDto>(`/leaves${query ? `?${query}` : ''}`);
  }

  getLeaveById(id: string): Promise<LeaveResponseDto> {
    return http.get<LeaveResponseDto>(`/leaves/${id}`);
  }

  submitLeave(data: SubmitLeaveType): Promise<LeaveResponseDto> {
    return http.post<LeaveResponseDto>('/leaves', data);
  }

  approveLeave(data: ReviewLeaveType): Promise<LeaveResponseDto> {
    return http.patch<LeaveResponseDto>('/leaves/approve', data);
  }

  rejectLeave(data: ReviewLeaveType): Promise<LeaveResponseDto> {
    return http.patch<LeaveResponseDto>('/leaves/reject', data);
  }

  deleteLeave(data: DeleteLeaveType): Promise<void> {
    return http.delete<void>('/leaves/soft', data);
  }
}

export const leaveService = new LeaveService();
