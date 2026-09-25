'use client';

import { syncMetaThemeColor, useThemeStore } from '@ecomerece/frontend/theme';
import { type ReactNode, useEffect } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isInitialized = useThemeStore((s) => s.isInitialized);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    void initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (isInitialized) syncMetaThemeColor();
  }, [isInitialized]);

  return <>{children}</>;
}
