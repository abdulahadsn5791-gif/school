import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 3. SUBJECT
// ---------------------------------------------------------------------------

const subjectSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g. "Mathematics"
    code: { type: String, required: true }, // e.g. "MATH-101"
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

subjectSchema.index(
  { schoolId: 1, code: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type SubjectPersistence = InferSchemaType<typeof subjectSchema>;
export type SubjectDocument = HydratedDocument<SubjectPersistence>;
export const SubjectModel = mongoose.model<SubjectPersistence>('Subject', subjectSchema);
