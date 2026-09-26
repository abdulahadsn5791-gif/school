export type ReportReadModel = {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  termId: string;
  academicYear: string;
  subjects: {
    subjectId: string;
    homeworkMarks: number;
    testMarks: number;
    oralMarks: number;
    totalObtained: number;
    maxMarks: number;
    grade: string;
    teacherRemarks: string | null;
  }[];
  overallPercentage: number;
  overallGrade: string;
  attendancePercentage: number | null;
  generalRemarks: string | null;
  generatedBy: string;
  isDeleted: boolean;
  createdAt: Date;
};
