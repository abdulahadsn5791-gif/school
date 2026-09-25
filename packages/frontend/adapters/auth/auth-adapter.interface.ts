export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
}

export interface AuthAdapter {
  ensureReady(): Promise<void>;
  isSignedIn(): boolean;
  signInWithGoogle(): Promise<void>;
  getUser(): Promise<Partial<AuthUser> | null>;
  signOut(): Promise<void>;
  getToken(): Promise<string | null>;
  isTokenValid(): Promise<boolean>;
  isExpired(): Promise<boolean>;
}
