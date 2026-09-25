export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export type TabItem = {
  id: string;
  label: string;
  path: string;
  closable?: boolean;
  icon?: string;
};

export type CommandItem = {
  id: string;
  label: string;
  category: string;
  shortcut?: string[];
  action: () => void;
};
