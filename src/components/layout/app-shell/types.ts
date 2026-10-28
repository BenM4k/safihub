import type { ElementType, ReactNode } from "react";

export interface AppShellNavItem {
  href: string;
  label: string;
  icon: ElementType;
  badge?: number | string | null;
  badgeVariant?: "default" | "warning" | "destructive" | "success";
  external?: boolean;
  exactMatch?: boolean;
}

export interface AppShellNavGroup {
  title?: string;
  items: AppShellNavItem[];
}

export interface AppShellUser {
  id?: string;
  name?: string | null;
  role?: string | null;
  email?: string | null;
}

export interface AppShellProps {
  sidebarGroups: AppShellNavGroup[];
  mobileTabs: AppShellNavItem[];
  moreGroups?: AppShellNavGroup[];
  topBarLeft?: ReactNode;
  topBarRight?: ReactNode;
  user?: AppShellUser | null;
  publicViewHref?: string;
  publicViewLabel?: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  storageKey?: string;
  bannerNotice?: ReactNode;
  sidebarFooter?: ReactNode | ((isCollapsed: boolean) => ReactNode);
  mobileMoreExtra?: ReactNode;
  children: ReactNode;
}
