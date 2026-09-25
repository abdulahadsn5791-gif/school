import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema, subjectGradeSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 10. ACADEMIC REPORT
// ---------------------------------------------------------------------------

const reportSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    studentId: { type: String, ref: 'User', required: true },
    classId: { type: String, ref: 'Class', required: true },
    termId: { type: String, ref: 'AcademicTerm', required: true },
    academicYear: { type: String, required: true }, // denormalized for fast filtering
    subjects: { type: [subjectGradeSchema], default: [] },
    overallPercentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    attendancePercentage: { type: Number, default: null },
    generalRemarks: { type: String, default: null },
    generatedBy: { type: String, ref: 'User', required: true },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

reportSchema.index(
  { studentId: 1, termId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);
reportSchema.index({ schoolId: 1, classId: 1, termId: 1 });

export type ReportPersistence = InferSchemaType<typeof reportSchema>;
export type ReportDocument = HydratedDocument<ReportPersistence>;
export const ReportModel = mongoose.model<ReportPersistence>('Report', reportSchema);
