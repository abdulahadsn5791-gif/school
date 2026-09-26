export type AssignmentReadModel = {
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
};
