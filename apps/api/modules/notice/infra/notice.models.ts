import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 12. NOTICE / ANNOUNCEMENT
// ---------------------------------------------------------------------------

const noticeSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: {
      type: String,
      enum: ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS'],
      required: true,
      default: 'ALL',
    },
    classId: { type: String, ref: 'Class', default: null }, // required when audience === 'CLASS'
    publishedBy: { type: String, ref: 'User', required: true },
    publishAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: null },
    attachments: [{ type: String }],
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

noticeSchema.index({ schoolId: 1, audience: 1, publishAt: -1 });

export type NoticePersistence = InferSchemaType<typeof noticeSchema>;
export type NoticeDocument = HydratedDocument<NoticePersistence>;
export const NoticeModel = mongoose.model<NoticePersistence>('Notice', noticeSchema);
