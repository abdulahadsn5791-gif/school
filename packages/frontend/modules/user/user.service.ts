import type {
  AssignUserRoleType,
  BanUserType,
  BlockUserType,
  CreateUserType,
  DeleteUserType,
  ExtendBanType,
  GetAdminPaginatedUsersType,
  GetPaginatedUsersType,
  UpdateUserType,
  UserResponseReadModel,
} from '@ecomerece/shared';
import { http } from '../../lib';

export type UserMutationResult = {
  message: string;
};

export type PaginatedUsersResult = {
  data: UserResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class UserService {
  getMe(): Promise<UserResponseReadModel> {
    return http.get<UserResponseReadModel>('/users/me');
  }

  getUserById(id: string): Promise<UserResponseReadModel> {
    return http.get<UserResponseReadModel>(`/users/${id}`);
  }

  getPaginatedUsers(params: GetPaginatedUsersType): Promise<PaginatedUsersResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<PaginatedUsersResult>(`/users${query ? `?${query}` : ''}`);
  }

  getAdminPaginatedUsers(params: GetAdminPaginatedUsersType): Promise<PaginatedUsersResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.blocked !== undefined) searchParams.set('blocked', String(params.blocked));
    if (params.banned !== undefined) searchParams.set('banned', String(params.banned));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const query = searchParams.toString();
    return http.get<PaginatedUsersResult>(`/users/admin/all${query ? `?${query}` : ''}`);
  }

  createUser(data: CreateUserType): Promise<UserResponseReadModel> {
    return http.post<UserResponseReadModel>('/users', data);
  }

  updateUser(id: string, data: UpdateUserType): Promise<UserResponseReadModel> {
    return http.patch<UserResponseReadModel>(`/users/${id}`, data);
  }

  assignRole(data: AssignUserRoleType): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/role', data);
  }

  softDeleteUser(data: DeleteUserType): Promise<void> {
    return http.delete<void>('/users/soft', data);
  }

  recoverUser(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/recover', { userId });
  }

  blockUser(data: BlockUserType): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/block', data);
  }

  blockLift(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/block/lift', { userId });
  }

  banUser(data: BanUserType): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban', data);
  }

  banLift(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/lift', { userId });
  }

  extendBan(data: ExtendBanType): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/extend', data);
  }

  shortenBan(data: ExtendBanType): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/short', data);
  }
}

export const userService = new UserService();
