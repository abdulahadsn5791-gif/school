import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { TabItem } from './navigation.types';

interface TabsState {
  tabs: TabItem[];
  activeTabId: string | null;

  openTab: (tab: TabItem) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  closeOtherTabs: (id: string) => void;
  closeAllTabs: () => void;
}

/**
 * Multi-tab workspace state.
 * Persisted in sessionStorage so tab states survive refreshes within the same browser tab.
 */
export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      openTab: (tab) => {
        const { tabs } = get();
        const exists = tabs.some((t) => t.id === tab.id);
        if (!exists) {
          set({ tabs: [...tabs, tab], activeTabId: tab.id });
        } else {
          set({ activeTabId: tab.id });
        }
      },

      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const newTabs = tabs.filter((t) => t.id !== id);
        let newActiveId = activeTabId;

        if (activeTabId === id) {
          const closedIndex = tabs.findIndex((t) => t.id === id);
          const nextTab = newTabs[closedIndex] || newTabs[closedIndex - 1];
          newActiveId = nextTab ? nextTab.id : null;
        }

        set({ tabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (activeTabId) => set({ activeTabId }),

      closeOtherTabs: (id) => {
        const { tabs } = get();
        set({
          tabs: tabs.filter((t) => t.id === id || t.closable === false),
          activeTabId: id,
        });
      },

      closeAllTabs: () => {
        const { tabs } = get();
        set({
          tabs: tabs.filter((t) => t.closable === false),
          activeTabId: null,
        });
      },
    }),
    {
      name: 'tabs-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
);

export const useActiveTab = () =>
  useTabsStore((state) => state.tabs.find((t) => t.id === state.activeTabId) ?? null);

export const useTabCount = () => useTabsStore((state) => state.tabs.length);
