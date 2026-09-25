export type ClassReadModel = {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  classTeacherId: string | null;
  isDeleted: boolean;
  createdAt: Date;
};
