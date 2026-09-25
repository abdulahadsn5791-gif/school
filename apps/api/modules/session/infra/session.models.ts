import mongoose, { type HydratedDocument, type InferSchemaType } from 'mongoose';

// ---------------------------------------------------------------------------
// 15. REFRESH TOKEN / SESSION
// ---------------------------------------------------------------------------

const refreshTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true },
    tokenHash: { type: String, required: true }, // never store the raw token
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenPersistence = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDocument = HydratedDocument<RefreshTokenPersistence>;
export const RefreshTokenModel = mongoose.model<RefreshTokenPersistence>(
  'RefreshToken',
  refreshTokenSchema,
);
