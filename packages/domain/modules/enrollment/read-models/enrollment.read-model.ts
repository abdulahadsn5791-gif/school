export type EnrollmentReadModel = {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  rollNumber: string | null;
  academicYear: string;
  isDeleted: boolean;
  createdAt: Date;
};
