import type {
  AttendanceListResponseDto,
  AttendanceResponseDto,
  DeleteAttendanceType,
  GetAttendanceType,
  MarkAttendanceType,
  UpdateAttendanceType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class AttendanceService {
  list(params: GetAttendanceType): Promise<AttendanceListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.studentId) searchParams.set('studentId', params.studentId);
    if (params.fromDate) searchParams.set('fromDate', params.fromDate.toISOString());
    if (params.toDate) searchParams.set('toDate', params.toDate.toISOString());
    if (params.status) searchParams.set('status', params.status);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<AttendanceListResponseDto>(`/attendance${query ? `?${query}` : ''}`);
  }

  getByStudent(
    studentId: string,
    fromDate: string,
    toDate: string,
  ): Promise<AttendanceResponseDto[]> {
    const searchParams = new URLSearchParams({
      studentId,
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
    });
    return http.get<AttendanceResponseDto[]>(`/attendance/student?${searchParams.toString()}`);
  }

  getByClassAndDate(classId: string, date: string): Promise<AttendanceResponseDto[]> {
    return http.get<AttendanceResponseDto[]>(
      `/attendance/class-day?classId=${encodeURIComponent(classId)}&fromDate=${new Date(date).toISOString()}`,
    );
  }

  mark(data: MarkAttendanceType): Promise<AttendanceResponseDto[]> {
    return http.post<AttendanceResponseDto[]>('/attendance/mark', data);
  }

  update(data: UpdateAttendanceType): Promise<AttendanceResponseDto> {
    return http.patch<AttendanceResponseDto>('/attendance', data);
  }

  deleteAttendance(data: DeleteAttendanceType): Promise<void> {
    return http.delete<void>('/attendance/soft', data);
  }
}

export const attendanceService = new AttendanceService();
