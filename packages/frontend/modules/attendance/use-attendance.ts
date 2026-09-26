import {
  type DeleteAttendanceType,
  deleteAttendanceDto,
  type GetAttendanceType,
  getAttendanceDto,
  type MarkAttendanceType,
  markAttendanceDto,
  type UpdateAttendanceType,
  updateAttendanceDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from './attendance.service';

export const ATTENDANCE_QUERY_KEY = ['attendance'];

export function useGetAttendance(params: GetAttendanceType) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'list', params],
    queryFn: () => attendanceService.list(getAttendanceDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetStudentAttendance(studentId: string, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'student', studentId, fromDate, toDate],
    queryFn: () => attendanceService.getByStudent(studentId, fromDate, toDate),
    enabled: Boolean(studentId) && Boolean(fromDate) && Boolean(toDate),
  });
}

export function useGetClassDayAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, 'class-day', classId, date],
    queryFn: () => attendanceService.getByClassAndDate(classId, date),
    enabled: Boolean(classId) && Boolean(date),
  });
}

function applyAttendanceMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkAttendanceType) => attendanceService.mark(markAttendanceDto.parse(data)),
    onSuccess: () => applyAttendanceMutationResult(queryClient),
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAttendanceType) =>
      attendanceService.update(updateAttendanceDto.parse(data)),
    onSuccess: () => applyAttendanceMutationResult(queryClient),
  });
}

export function useSoftDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteAttendanceType) =>
      attendanceService.deleteAttendance(deleteAttendanceDto.parse(data)),
    onSuccess: () => applyAttendanceMutationResult(queryClient),
  });
}
