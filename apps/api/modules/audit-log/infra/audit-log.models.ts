import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

// ---------------------------------------------------------------------------
// 16. AUDIT LOG
// ---------------------------------------------------------------------------

const auditLogSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    schoolId: { type: String, ref: 'School', default: null },
    actorId: { type: String, ref: 'User', default: null },
    action: { type: String, required: true }, // e.g. "USER_ROLE_CHANGED"
    entityType: { type: String, required: true }, // e.g. "User"
    entityId: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    at: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, versionKey: false },
);

auditLogSchema.index({ entityType: 1, entityId: 1, at: -1 });
auditLogSchema.index({ schoolId: 1, at: -1 });

export type AuditLogPersistence = InferSchemaType<typeof auditLogSchema>;
export type AuditLogDocument = HydratedDocument<AuditLogPersistence>;
export const AuditLogModel = mongoose.model<AuditLogPersistence>('AuditLog', auditLogSchema);
