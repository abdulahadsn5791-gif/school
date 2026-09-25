import type { LoginUserType, UserResponseReadModel } from '@ecomerece/shared';
import { http } from '../../lib';
import { useAuthStore } from '../../services/auth-session.service';

export const authService = {
  async login(data: LoginUserType): Promise<{ token: string; user: UserResponseReadModel }> {
    const session = await http.post<{ token: string; user: UserResponseReadModel }>(
      '/users/login',
      data,
    );
    useAuthStore.getState().setSession(session);
    return session;
  },

  logout(): void {
    useAuthStore.getState().clearSession();
  },

  getMe(): Promise<UserResponseReadModel> {
    return http.get<UserResponseReadModel>('/users/me');
  },
};
