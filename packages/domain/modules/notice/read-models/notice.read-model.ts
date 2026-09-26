export type NoticeReadModel = {
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
};
