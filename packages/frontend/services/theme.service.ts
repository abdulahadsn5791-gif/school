import { create } from 'zustand';
import { storageAdapter } from '../adapters/storage';

const THEME_KEY = 'theme';
const GLASS_KEY = 'glass';

export type ThemeChoice = 'auto' | 'light' | 'dark';

export type ThemeResolved = Exclude<ThemeChoice, 'auto'>;

interface ThemeState {
  choice: ThemeChoice;
  glass: boolean;
  isInitialized: boolean;
  setTheme: (choice: ThemeChoice) => void;
  setGlass: (enabled: boolean) => void;
  initTheme: () => Promise<void>;
}

export function syncMetaThemeColor() {
  if (typeof document === 'undefined') return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
  const parts = bg.split(/\s+/);
  if (parts.length < 3) return;
  const color = `rgb(${parts[0]} ${parts[1]} ${parts[2]})`;
  let tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'theme-color';
    document.head.appendChild(tag);
  }
  tag.content = color;
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
}

function applyGlass(enabled: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-glass', enabled ? 'on' : 'off');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  choice: 'auto',
  glass: false,
  isInitialized: false,

  setTheme: (choice: ThemeChoice) => {
    set({ choice });
    if (typeof window !== 'undefined') {
      applyTheme(choice);
      void storageAdapter.setItem(THEME_KEY, choice === 'auto' ? '' : choice);
      syncMetaThemeColor();
    }
  },

  setGlass: (enabled: boolean) => {
    set({ glass: enabled });
    if (typeof window !== 'undefined') {
      applyGlass(enabled);
      void storageAdapter.setItem(GLASS_KEY, enabled ? '1' : '');
      syncMetaThemeColor();
    }
  },

  initTheme: async () => {
    if (get().isInitialized || typeof window === 'undefined') return;

    try {
      await storageAdapter.ensureReady();
      const stored = await storageAdapter.getItem<string>(THEME_KEY);
      const choice: ThemeChoice = stored === 'dark' || stored === 'light' ? stored : 'auto';
      const glassStored = await storageAdapter.getItem<string>(GLASS_KEY);
      const glass = glassStored === '1';
      set({ isInitialized: true });
      get().setTheme(choice);
      get().setGlass(glass);
    } catch {
      set({ isInitialized: true });
    }
  },
}));

export function resolveTheme(choice: ThemeChoice): ThemeResolved {
  if (choice !== 'auto') return choice;
  if (typeof window !== 'undefined' && typeof matchMedia !== 'undefined') {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function useTheme() {
  const choice = useThemeStore((s) => s.choice);
  const glass = useThemeStore((s) => s.glass);
  return {
    choice,
    glass,
    resolved: resolveTheme(choice),
    setTheme: useThemeStore((s) => s.setTheme),
    setGlass: useThemeStore((s) => s.setGlass),
  };
}
