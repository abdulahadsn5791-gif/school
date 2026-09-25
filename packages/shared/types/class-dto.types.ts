export type ClassListResponseDto = {
  data: ClassResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface ClassResponseDto {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId: string | null;
  isDeleted: boolean;
  createdAt: Date;
}

export type EnrollmentListResponseDto = {
  data: EnrollmentResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface EnrollmentResponseDto {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  rollNumber: string | null;
  academicYear: string;
  isDeleted: boolean;
  createdAt: Date;
}
