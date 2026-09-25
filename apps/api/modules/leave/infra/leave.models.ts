import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

import { deletedSchema } from '../../common/common-schemas';

// ---------------------------------------------------------------------------
// 13. LEAVE APPLICATION
// ---------------------------------------------------------------------------

const leaveApplicationSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', required: true },
    applicantId: { type: String, ref: 'User', required: true },
    applicantRole: { type: String, enum: ['student', 'teacher'], required: true },
    classId: { type: String, ref: 'Class', default: null },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    reviewedBy: { type: String, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewRemark: { type: String, default: null },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

leaveApplicationSchema.index({ applicantId: 1, fromDate: 1 });
leaveApplicationSchema.index({ schoolId: 1, status: 1 });

export type LeaveApplicationPersistence = InferSchemaType<typeof leaveApplicationSchema>;
export type LeaveApplicationDocument = HydratedDocument<LeaveApplicationPersistence>;
export const LeaveApplicationModel = mongoose.model<LeaveApplicationPersistence>(
  'LeaveApplication',
  leaveApplicationSchema,
);
