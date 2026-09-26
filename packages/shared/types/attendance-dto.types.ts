export type AttendanceListResponseDto = {
  data: AttendanceResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface AttendanceResponseDto {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  subjectId: string | null;
  periodId: string | null;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remark: string | null;
  markedBy: string;
  isDeleted: boolean;
  createdAt: Date;
}
