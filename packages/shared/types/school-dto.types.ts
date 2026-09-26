export type SchoolListResponseDto = {
  data: SchoolResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface SchoolResponseDto {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  timezone: string;
  isDeleted: boolean;
  createdAt: Date;
}
