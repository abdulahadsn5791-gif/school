export type AttendanceReadModel = {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  subjectId: string | null;
  periodId: string | null;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remark: string | null;
  markedBy: string;
  isDeleted: boolean;
  createdAt: Date;
};
