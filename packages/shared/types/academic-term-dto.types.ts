export type AcademicTermListResponseDto = {
  data: AcademicTermResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface AcademicTermResponseDto {
  id: string;
  schoolId: string;
  academicYear: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
