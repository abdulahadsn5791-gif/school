import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 0b. ACADEMIC TERM
// ---------------------------------------------------------------------------

const academicTermSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    academicYear: { type: String, required: true }, // e.g. "2026-2027"
    name: { type: String, required: true }, // e.g. "Term 1"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false, required: true },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

academicTermSchema.index(
  { schoolId: 1, academicYear: 1, name: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type AcademicTermPersistence = InferSchemaType<typeof academicTermSchema>;
export type AcademicTermDocument = HydratedDocument<AcademicTermPersistence>;
export const AcademicTermModel = mongoose.model<AcademicTermPersistence>(
  'AcademicTerm',
  academicTermSchema,
);
