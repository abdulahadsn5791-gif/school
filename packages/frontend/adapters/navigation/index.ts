import { useHistoryStackStore } from './history-stack.store';
import { usePageMetaStore } from './page-meta.store';

export * from './command-palette.store';
export * from './history-stack.store';
export * from './navigation.types';
export * from './page-meta.store';
export * from './shell.store';
export * from './tabs.store';
export * from './wizard.store';

/**
 * Resets navigation state (page meta and history stack).
 */
export const resetNavigationState = () => {
  usePageMetaStore.getState().resetPageMeta();
  useHistoryStackStore.getState().clearHistory();
};
