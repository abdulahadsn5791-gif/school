export type TimetableEntryListResponseDto = {
  data: TimetableEntryResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface TimetableEntryResponseDto {
  id: string;
  schoolId: string;
  academicYear: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  isDeleted: boolean;
  createdAt: Date;
}
