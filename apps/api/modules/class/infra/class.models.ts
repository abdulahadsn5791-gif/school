import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 2. CLASS
// ---------------------------------------------------------------------------

const classSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g. "Grade 6-A"
    grade: { type: String, required: true }, // e.g. "6"
    section: { type: String, required: true }, // e.g. "A"
    academicYear: { type: String, required: true }, // e.g. "2026-2027"
    classTeacherId: { type: String, ref: 'User', default: null },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

classSchema.index(
  { schoolId: 1, grade: 1, section: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type ClassPersistence = InferSchemaType<typeof classSchema>;
export type ClassDocument = HydratedDocument<ClassPersistence>;
export const ClassModel = mongoose.model<ClassPersistence>('Class', classSchema);
