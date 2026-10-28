"use client";

import { useSyncExternalStore } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppTopBar } from "./app-top-bar";
import { AppBottomNav } from "./app-bottom-nav";
import type { AppShellProps } from "./types";

export * from "./types";
export * from "./app-sidebar";
export * from "./app-top-bar";
export * from "./app-bottom-nav";

export function AppShell({
  sidebarGroups,
  mobileTabs,
  moreGroups = [],
  topBarLeft,
  topBarRight,
  user,
  publicViewHref,
  publicViewLabel,
  soundEnabled = true,
  onToggleSound,
  storageKey = "safihub_partner_sidebar_collapsed",
  bannerNotice,
  sidebarFooter,
  mobileMoreExtra,
  children,
}: AppShellProps) {
  const isCollapsed = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      try {
        return localStorage.getItem(storageKey) === "true";
      } catch {
        return false;
      }
    },
    () => false
  );

  function handleToggleCollapse() {
    try {
      const next = !isCollapsed;
      localStorage.setItem(storageKey, String(next));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Storage unavailable
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans antialiased">
      {/* Desktop Sidebar (hidden on mobile < 768px) */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        <AppSidebar
          groups={sidebarGroups}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          footer={sidebarFooter}
          className="h-full"
        />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {bannerNotice}

        <AppTopBar
          leftContent={topBarLeft}
          rightExtra={topBarRight}
          user={user}
          publicViewHref={publicViewHref}
          publicViewLabel={publicViewLabel}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />

        <main className="flex-1 min-w-0 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (hidden on desktop >= 768px) */}
      <AppBottomNav
        tabs={mobileTabs}
        moreGroups={moreGroups}
        user={user}
        moreExtra={mobileMoreExtra}
      />
    </div>
  );
}
