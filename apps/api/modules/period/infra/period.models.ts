import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 4. PERIOD
// ---------------------------------------------------------------------------

const periodSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g. "1st Period"
    startTime: { type: String, required: true }, // e.g. "08:00 AM"
    endTime: { type: String, required: true }, // e.g. "08:45 AM"
    order: { type: Number, required: true }, // 1, 2, 3...
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

periodSchema.index(
  { schoolId: 1, order: 1 },
  { unique: true, partialFilterExpression: { 'deleted.deleted': false } },
);

export type PeriodPersistence = InferSchemaType<typeof periodSchema>;
export type PeriodDocument = HydratedDocument<PeriodPersistence>;
export const PeriodModel = mongoose.model<PeriodPersistence>('Period', periodSchema);
