export type StudentTestListResponseDto = {
  data: StudentTestResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface StudentTestResponseDto {
  id: string;
  schoolId: string;
  assignmentId: string;
  studentId: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'MISSED';
  submissionText: string | null;
  submissionFiles: string[];
  submittedAt: Date | null;
  marksObtained: number | null;
  teacherFeedback: string | null;
  gradedBy: string | null;
  gradedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
}
