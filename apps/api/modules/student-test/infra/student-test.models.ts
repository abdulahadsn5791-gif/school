import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 9. STUDENT TEST / SUBMISSION
// ---------------------------------------------------------------------------

const studentTestSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    assignmentId: { type: String, ref: 'Assignment', required: true },
    studentId: { type: String, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'GRADED', 'MISSED'],
      default: 'PENDING',
      required: true,
    },
    submissionText: { type: String, default: null },
    submissionFiles: [{ type: String }],
    submittedAt: { type: Date, default: null },
    marksObtained: { type: Number, default: null },
    teacherFeedback: { type: String, default: null },
    gradedBy: { type: String, ref: 'User', default: null },
    gradedAt: { type: Date, default: null },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

studentTestSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type StudentTestPersistence = InferSchemaType<typeof studentTestSchema>;
export type StudentTestDocument = HydratedDocument<StudentTestPersistence>;
export const StudentTestModel = mongoose.model<StudentTestPersistence>(
  'StudentTest',
  studentTestSchema,
);
