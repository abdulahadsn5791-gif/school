export type UserRolesType = 'teacher' | 'student' | 'admin';

export interface AvatarReadModelDto {
  url: string | null;
  publicId: string | null;
  createdOn: Date | null;
}

export interface UserResponseReadModel {
  id: string;
  fullName: string;
  email: string | null;
  avatar: AvatarReadModelDto | null;
  role: UserRolesType;
  isBlocked: boolean;
  isBanned: boolean;
  isDeleted: boolean;
  bannedUntil: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
}

/** Same as {@link UserResponseReadModel} plus moderation metadata — never returned on public list routes. */
export interface UserProfileReadModel extends UserResponseReadModel {
  banReason: string | null;
  banFrom: Date | null;
  blockedReason: string | null;
  blockedFrom: Date | null;
  deleteReason: string | null;
  deletedFrom: Date | null;
}

export interface AuthResponseDto {
  token: string;
  user: UserResponseReadModel;
}
