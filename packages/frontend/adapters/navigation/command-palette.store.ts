import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CommandPaletteState {
  isCommandPaletteOpen: boolean;
  commandQuery: string;
  recentSearches: string[];

  setCommandPaletteOpen: (isOpen: boolean) => void;
  setCommandQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const MAX_RECENT_SEARCHES = 5;

/**
 * Cmd+K / quick search command palette state.
 */
export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set, get) => ({
      isCommandPaletteOpen: false,
      commandQuery: '',
      recentSearches: [],

      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
      setCommandQuery: (commandQuery) => set({ commandQuery }),

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        const filtered = get().recentSearches.filter((s) => s !== query);
        set({ recentSearches: [query, ...filtered].slice(0, MAX_RECENT_SEARCHES) });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'command-palette-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
