import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema, nameSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 1b. GUARDIAN + STUDENT-GUARDIAN
// ---------------------------------------------------------------------------

const guardianSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    name: { type: nameSchema, required: true },
    email: { type: String, default: null },
    phone: { type: String, required: true },
    occupation: { type: String, default: null },
    userId: { type: String, ref: 'User', default: null }, // set if guardian also logs in
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

guardianSchema.index({ schoolId: 1, phone: 1 });

const studentGuardianSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    studentId: { type: String, ref: 'User', required: true },
    guardianId: { type: String, ref: 'Guardian', required: true },
    relation: {
      type: String,
      enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'],
      required: true,
    },
    isPrimary: { type: Boolean, default: false, required: true },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

studentGuardianSchema.index(
  { studentId: 1, guardianId: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);
studentGuardianSchema.index({ guardianId: 1 });

export type GuardianPersistence = InferSchemaType<typeof guardianSchema>;
export type GuardianDocument = HydratedDocument<GuardianPersistence>;
export const GuardianModel = mongoose.model<GuardianPersistence>('Guardian', guardianSchema);

export type StudentGuardianPersistence = InferSchemaType<typeof studentGuardianSchema>;
export type StudentGuardianDocument = HydratedDocument<StudentGuardianPersistence>;
export const StudentGuardianModel = mongoose.model<StudentGuardianPersistence>(
  'StudentGuardian',
  studentGuardianSchema,
);
