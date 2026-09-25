import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 5. STUDENT ENROLLMENT
// ---------------------------------------------------------------------------

const studentEnrollmentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    studentId: { type: String, ref: 'User', required: true },
    classId: { type: String, ref: 'Class', required: true },
    rollNumber: { type: String, default: null },
    academicYear: { type: String, required: true }, // e.g. "2026-2027"
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

studentEnrollmentSchema.index(
  { schoolId: 1, studentId: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);
studentEnrollmentSchema.index(
  { schoolId: 1, classId: 1, rollNumber: 1, academicYear: 1 },
  {
    unique: true,
    partialFilterExpression: { 'deleted.deleted': false, rollNumber: { $type: 'string' } },
  },
);

export type StudentEnrollmentPersistence = InferSchemaType<typeof studentEnrollmentSchema>;
export type StudentEnrollmentDocument = HydratedDocument<StudentEnrollmentPersistence>;
export const StudentEnrollmentModel = mongoose.model<StudentEnrollmentPersistence>(
  'StudentEnrollment',
  studentEnrollmentSchema,
);
