export type GuardianListResponseDto = {
  data: GuardianResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface GuardianResponseDto {
  id: string;
  schoolId: string;
  name: { firstName: string; middleName: string | null; lastName: string | null; fullName: string };
  phone: string;
  email: string | null;
  occupation: string | null;
  userId: string | null;
  isDeleted: boolean;
  createdAt: Date;
}
