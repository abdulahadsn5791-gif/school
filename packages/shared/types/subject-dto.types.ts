export type SubjectListResponseDto = {
  data: SubjectResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface SubjectResponseDto {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  isDeleted: boolean;
  createdAt: Date;
}
