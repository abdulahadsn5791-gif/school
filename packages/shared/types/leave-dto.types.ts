export type LeaveListResponseDto = {
  data: LeaveResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface LeaveResponseDto {
  id: string;
  schoolId: string;
  applicantId: string;
  applicantRole: 'student' | 'teacher';
  classId: string | null;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewRemark: string | null;
  isDeleted: boolean;
  createdAt: Date;
}
