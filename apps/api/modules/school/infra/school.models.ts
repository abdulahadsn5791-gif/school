import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 0. SCHOOL
// ---------------------------------------------------------------------------

const schoolSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true }, // short slug, e.g. "LHR01"
    address: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    logoUrl: { type: String, default: null },
    timezone: { type: String, default: 'Asia/Karachi' },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

schoolSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type SchoolPersistence = InferSchemaType<typeof schoolSchema>;
export type SchoolDocument = HydratedDocument<SchoolPersistence>;
export const SchoolModel = mongoose.model<SchoolPersistence>('School', schoolSchema);
