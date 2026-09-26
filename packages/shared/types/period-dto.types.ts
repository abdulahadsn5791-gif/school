export type PeriodListResponseDto = {
  data: PeriodResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface PeriodResponseDto {
  id: string;
  schoolId: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
}
