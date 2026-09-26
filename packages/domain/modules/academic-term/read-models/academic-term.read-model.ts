export type AcademicTermReadModel = {
  id: string;
  schoolId: string;
  academicYear: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isDeleted: boolean;
  createdAt: Date;
};
