import { create } from 'zustand';

interface ShellState {
  isSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;
  sidebarCollapsedWidth: number;
  activeGroupKey: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMobileDrawerOpen: (isOpen: boolean) => void;
  setActiveGroupKey: (key: string | null) => void;
}

/**
 * Shell layout state: sidebar open/closed, mobile drawer, active nav group.
 * Not persisted — viewport layout state changes frequently.
 */
export const useShellStore = create<ShellState>()((set) => ({
  isSidebarOpen: true,
  isMobileDrawerOpen: false,
  sidebarCollapsedWidth: 80,
  activeGroupKey: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setActiveGroupKey: (activeGroupKey) => set({ activeGroupKey }),
}));
