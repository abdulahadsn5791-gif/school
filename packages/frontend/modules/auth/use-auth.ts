import type { LoginUserType } from '@ecomerece/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../services/auth-session.service';
import { authService } from './auth.service';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  return { user, token, isInitialized, isSignedIn: Boolean(token) };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginUserType) => authService.login(data),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => authService.logout(),
    onSuccess: () => queryClient.clear(),
  });
}
