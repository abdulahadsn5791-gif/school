export type EventListResponseDto = {
  data: EventResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface EventResponseDto {
  id: string;
  schoolId: string;
  title: string;
  description: string | null;
  type: 'HOLIDAY' | 'EXAM' | 'MEETING' | 'ACTIVITY' | 'OTHER';
  startDate: Date;
  endDate: Date;
  classId: string | null;
  isDeleted: boolean;
  createdAt: Date;
}
