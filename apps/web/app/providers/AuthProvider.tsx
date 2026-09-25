'use client';

import { useAuthStore } from '@ecomerece/frontend';
import { type ReactNode, useEffect } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
