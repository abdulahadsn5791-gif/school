import { create } from 'zustand';

interface HistoryStackState {
  historyStack: string[];

  pushHistory: (path: string) => void;
  popHistory: () => string | undefined;
  clearHistory: () => void;
}

/**
 * Generic back stack independent of browser history.
 * Useful for multi-level dialogs, drawers, and modal drill-down steps.
 */
export const useHistoryStackStore = create<HistoryStackState>()((set, get) => ({
  historyStack: [],

  pushHistory: (path) =>
    set((state) => ({
      historyStack: [...state.historyStack, path],
    })),

  popHistory: () => {
    const stack = get().historyStack;
    const popped = stack[stack.length - 1];
    set({ historyStack: stack.slice(0, -1) });
    return popped;
  },

  clearHistory: () => set({ historyStack: [] }),
}));
