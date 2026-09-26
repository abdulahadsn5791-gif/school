export type SessionReadModel = {
  id: string;
  userId: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
};
