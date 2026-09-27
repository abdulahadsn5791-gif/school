import type {
  CreateTimetableEntryType,
  DeleteTimetableEntryType,
  GetTimetableEntriesType,
  TeacherTimetableScreenDto,
  TimetableEntryListResponseDto,
  TimetableEntryResponseDto,
  UpdateTimetableEntryType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class TimetableService {
  /** Composed screen (new.md §6): one request replaces the 5-query client join. */
  getTeacherTimetableScreen(): Promise<TeacherTimetableScreenDto> {
    return http.get<TeacherTimetableScreenDto>('/timetable/screen/teacher');
  }

  getEntries(params: GetTimetableEntriesType): Promise<TimetableEntryListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.teacherId) searchParams.set('teacherId', params.teacherId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.dayOfWeek) searchParams.set('dayOfWeek', params.dayOfWeek);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<TimetableEntryListResponseDto>(`/timetable${query ? `?${query}` : ''}`);
  }

  getEntryById(id: string): Promise<TimetableEntryResponseDto> {
    return http.get<TimetableEntryResponseDto>(`/timetable/${id}`);
  }

  createEntry(data: CreateTimetableEntryType): Promise<TimetableEntryResponseDto> {
    return http.post<TimetableEntryResponseDto>('/timetable', data);
  }

  updateEntry(data: UpdateTimetableEntryType): Promise<TimetableEntryResponseDto> {
    return http.patch<TimetableEntryResponseDto>('/timetable', data);
  }

  deleteEntry(data: DeleteTimetableEntryType): Promise<void> {
    return http.delete<void>('/timetable/soft', data);
  }

  recoverEntry(timetableEntryId: string): Promise<TimetableEntryResponseDto> {
    return http.patch<TimetableEntryResponseDto>('/timetable/recover', { timetableEntryId });
  }
}

export const timetableService = new TimetableService();
