import type { UserResponseReadModel } from '@ecomerece/shared';
import { create } from 'zustand';
import { storageAdapter } from '../adapters/storage';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

export interface AuthSession {
  token: string;
  user: UserResponseReadModel;
}

interface AuthSessionState {
  user: UserResponseReadModel | null;
  token: string | null;
  isInitialized: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  initAuth: () => Promise<void>;
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthSessionState>((set, get) => ({
  user: null,
  token: null,
  isInitialized: false,

  setSession: ({ token, user }) => {
    set({ token, user });
    if (typeof window !== 'undefined') {
      void storageAdapter.setItem(TOKEN_KEY, token);
      void storageAdapter.setItem(USER_KEY, user);
    }
  },

  clearSession: () => {
    set({ token: null, user: null });
    if (typeof window !== 'undefined') {
      void storageAdapter.removeItem(TOKEN_KEY);
      void storageAdapter.removeItem(USER_KEY);
    }
  },

  initAuth: async () => {
    if (typeof window === 'undefined' || get().isInitialized) return;
    if (!initPromise) {
      initPromise = (async () => {
        try {
          await storageAdapter.ensureReady();
          const token = await storageAdapter.getItem<string>(TOKEN_KEY);
          const user = await storageAdapter.getItem<UserResponseReadModel>(USER_KEY);
          set({ token, user, isInitialized: true });
        } catch {
          set({ isInitialized: true });
        }
      })();
    }
    return initPromise;
  },
}));

/** Hydrate the session from storage (idempotent). Safe to call before every request. */
export function initAuth(): Promise<void> {
  return useAuthStore.getState().initAuth();
}

/** Synchronous token read for the HTTP client. Call `initAuth()` first. */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}
