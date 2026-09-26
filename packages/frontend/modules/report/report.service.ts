import type {
  CreateReportType,
  DeleteReportType,
  GetReportsType,
  ReportListResponseDto,
  ReportResponseDto,
  UpdateReportType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export class ReportService {
  getReports(params: GetReportsType): Promise<ReportListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params.schoolId) searchParams.set('schoolId', params.schoolId);
    if (params.studentId) searchParams.set('studentId', params.studentId);
    if (params.classId) searchParams.set('classId', params.classId);
    if (params.termId) searchParams.set('termId', params.termId);
    if (params.academicYear) searchParams.set('academicYear', params.academicYear);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<ReportListResponseDto>(`/reports${query ? `?${query}` : ''}`);
  }

  getReportById(id: string): Promise<ReportResponseDto> {
    return http.get<ReportResponseDto>(`/reports/${id}`);
  }

  createReport(data: CreateReportType): Promise<ReportResponseDto> {
    return http.post<ReportResponseDto>('/reports', data);
  }

  updateReport(data: UpdateReportType): Promise<ReportResponseDto> {
    return http.patch<ReportResponseDto>('/reports', data);
  }

  deleteReport(data: DeleteReportType): Promise<void> {
    return http.delete<void>('/reports/soft', data);
  }
}

export const reportService = new ReportService();
