export type ReportListResponseDto = {
  data: ReportResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface ReportSubjectGradeDto {
  subjectId: string;
  homeworkMarks: number;
  testMarks: number;
  oralMarks: number;
  totalObtained: number;
  maxMarks: number;
  grade: string;
  teacherRemarks: string | null;
}

export interface ReportResponseDto {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  termId: string;
  academicYear: string;
  subjects: ReportSubjectGradeDto[];
  overallPercentage: number;
  overallGrade: string;
  attendancePercentage: number | null;
  generalRemarks: string | null;
  generatedBy: string;
  isDeleted: boolean;
  createdAt: Date;
}
