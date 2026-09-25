import type { UserRolesType } from '../value-objects/role-info.vo';

export interface AvatarReadModel {
  url: string | null;
  publicId: string | null;
  createdOn: Date | null;
}

export interface UserReadModel {
  id: string;
  fullName: string;
  email: string | null;
  avatar: AvatarReadModel | null;
  role: UserRolesType;
  isBlocked: boolean;
  isBanned: boolean;
  bannedUntil: Date | null;
  isDeleted: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export type UserRoleType = UserRolesType;
