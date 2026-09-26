export type NoticeListResponseDto = {
  data: NoticeResponseDto[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export interface NoticeResponseDto {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS';
  classId: string | null;
  publishedBy: string;
  publishAt: Date;
  expiresAt: Date | null;
  attachments: string[];
  isDeleted: boolean;
  createdAt: Date;
}
