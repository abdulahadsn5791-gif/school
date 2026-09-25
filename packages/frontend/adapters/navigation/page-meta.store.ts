import { create } from 'zustand';
import type { BreadcrumbItem } from './navigation.types';

interface PageMetaState {
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  pageSubtitle: string | null;

  setPageMeta: (title: string, subtitle?: string | null, breadcrumbs?: BreadcrumbItem[]) => void;
  resetPageMeta: () => void;
}

/**
 * Route-driven header and breadcrumb state.
 * Kept in its own store so route changes don't cause unrelated UI to re-render.
 */
export const usePageMetaStore = create<PageMetaState>()((set) => ({
  breadcrumbs: [],
  pageTitle: '',
  pageSubtitle: null,

  setPageMeta: (title, subtitle = null, breadcrumbs = []) =>
    set({ pageTitle: title, pageSubtitle: subtitle, breadcrumbs }),

  resetPageMeta: () => set({ breadcrumbs: [], pageTitle: '', pageSubtitle: null }),
}));
