export type TimetableEntryReadModel = {
  id: string;
  schoolId: string;
  academicYear: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  periodId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  isDeleted: boolean;
  createdAt: Date;
};
