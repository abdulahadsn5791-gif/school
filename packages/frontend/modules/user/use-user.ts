import {
  type AssignUserRoleType,
  assignUserRoleDto,
  type BanUserType,
  type BlockUserType,
  banUserDto,
  blockUserDto,
  type CreateUserType,
  createUserDto,
  type DeleteUserType,
  deleteUserDto,
  type ExtendBanType,
  extendBanDto,
  type GetAdminPaginatedUsersType,
  type GetPaginatedUsersType,
  getAdminPaginatedUsersDto,
  getPaginatedUsersDto,
  type UpdateUserType,
  type UserRolesType,
  updateUserDto,
} from '@ecomerece/shared';
import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { userService } from './user.service';

export const USER_QUERY_KEY = ['users'];

export function useGetMe() {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'me'],
    queryFn: () => userService.getMe(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useGetUserById(userId: string) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, userId],
    queryFn: () => userService.getUserById(userId),
    enabled: Boolean(userId),
  });
}

export function useGetPaginatedUsers(params: GetPaginatedUsersType) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'paginated', params],
    queryFn: () => userService.getPaginatedUsers(getPaginatedUsersDto.parse(params)),
  });
}

export function useGetAdminPaginatedUsers(params: GetAdminPaginatedUsersType) {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, 'admin-paginated', params],
    queryFn: () => userService.getAdminPaginatedUsers(getAdminPaginatedUsersDto.parse(params)),
  });
}

export interface AdminUsersInfiniteFilters {
  search?: string;
  role?: UserRolesType;
  deleted?: boolean;
  blocked?: boolean;
  banned?: boolean;
  limit?: number;
}

export function useGetAdminUsersInfinite(filters: AdminUsersInfiniteFilters = {}) {
  const { limit = 30, ...rest } = filters;
  return useInfiniteQuery({
    queryKey: [...USER_QUERY_KEY, 'admin-infinite', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      userService.getAdminPaginatedUsers({
        ...rest,
        limit,
        cursor: pageParam,
        direction: 'next',
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });
}

function applyUserMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserType) => userService.createUser(createUserDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserType }) =>
      userService.updateUser(id, updateUserDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignUserRoleType) => userService.assignRole(assignUserRoleDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useSoftDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteUserType) => userService.softDeleteUser(deleteUserDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useRecoverUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.recoverUser(userId),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlockUserType) => userService.blockUser(blockUserDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useBlockLift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.blockLift(userId),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BanUserType) => userService.banUser(banUserDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useBanLift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.banLift(userId),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useExtendBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtendBanType) => userService.extendBan(extendBanDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}

export function useShortenBan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExtendBanType) => userService.shortenBan(extendBanDto.parse(data)),
    onSuccess: () => applyUserMutationResult(queryClient),
  });
}
