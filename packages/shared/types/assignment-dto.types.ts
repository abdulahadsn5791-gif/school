export type AssignmentListResponseDto = {
  data: AssignmentResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface AssignmentResponseDto {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  type: 'homework' | 'test' | 'oral';
  classId: string;
  subjectId: string;
  teacherId: string;
  assignedDate: Date;
  dueDate: Date;
  totalMarks: number;
  attachments: string[];
  isDeleted: boolean;
  createdAt: Date;
}
