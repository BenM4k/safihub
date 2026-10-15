"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Wallet,
  Clock,
  MapPin,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { AppShell, type AppShellNavGroup, type AppShellNavItem, type AppShellUser } from "@/components/layout/app-shell";
import { HouseSwitcher } from "./house-switcher";
import type { HouseMembershipInfo } from "@/dal";

interface PartnerShellProps {
  houseSlug: string;
  houseName: string;
  isPaused?: boolean;
  isAdminOverride?: boolean;
  memberships?: HouseMembershipInfo[];
  user?: AppShellUser | null;
  waitingCount?: number;
  children: ReactNode;
}

export function PartnerShell({
  houseSlug,
  houseName,
  isPaused,
  isAdminOverride,
  memberships = [],
  user,
  waitingCount = 0,
  children,
}: PartnerShellProps) {
  // Reactive sound preference with useSyncExternalStore
  const soundEnabled = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("safihub-sound-toggled", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("safihub-sound-toggled", callback);
      };
    },
    () => {
      try {
        const stored = localStorage.getItem("safihub_sound_enabled");
        return stored !== "false";
      } catch {
        return true;
      }
    },
    () => true
  );

  function handleToggleSound() {
    try {
      const next = !soundEnabled;
      localStorage.setItem("safihub_sound_enabled", String(next));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("safihub-sound-toggled"));
    } catch {
      // Storage unavailable
    }
  }

  const basePath = `/partner/${houseSlug}`;

  const sidebarGroups: AppShellNavGroup[] = [
    {
      items: [
        {
          href: basePath,
          label: "Accueil",
          icon: LayoutDashboard,
          exactMatch: true,
        },
        {
          href: `${basePath}/orders`,
          label: "Commandes",
          icon: ShoppingBag,
          badge: waitingCount > 0 ? waitingCount : null,
          badgeVariant: "warning",
        },
        {
          href: `${basePath}/catalogue`,
          label: "Catalogue et tarifs",
          icon: Tag,
        },
        {
          href: `${basePath}/settlements`,
          label: "Règlements",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Mon pressing",
      items: [
        {
          href: `${basePath}/hours`,
          label: "Horaires et fermetures",
          icon: Clock,
        },
        {
          href: `${basePath}/coverage`,
          label: "Zones couvertes",
          icon: MapPin,
        },
        {
          href: `${basePath}/settings`,
          label: "Paramètres",
          icon: Settings,
        },
      ],
    },
  ];

  const mobileTabs: AppShellNavItem[] = [
    {
      href: basePath,
      label: "Accueil",
      icon: LayoutDashboard,
      exactMatch: true,
    },
    {
      href: `${basePath}/orders`,
      label: "Commandes",
      icon: ShoppingBag,
      badge: waitingCount > 0 ? waitingCount : null,
      badgeVariant: "warning",
    },
    {
      href: `${basePath}/catalogue`,
      label: "Catalogue",
      icon: Tag,
    },
    {
      href: `${basePath}/settlements`,
      label: "Règlements",
      icon: Wallet,
    },
  ];

  const moreGroups: AppShellNavGroup[] = [
    {
      title: "Mon pressing",
      items: [
        {
          href: `${basePath}/hours`,
          label: "Horaires et fermetures",
          icon: Clock,
        },
        {
          href: `${basePath}/coverage`,
          label: "Zones couvertes",
          icon: MapPin,
        },
        {
          href: `${basePath}/settings`,
          label: "Paramètres",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <AppShell
      sidebarGroups={sidebarGroups}
      mobileTabs={mobileTabs}
      moreGroups={moreGroups}
      topBarLeft={
        <HouseSwitcher
          houseName={houseName}
          currentSlug={houseSlug}
          isPaused={isPaused}
          memberships={memberships}
        />
      }
      user={user}
      publicViewHref={`/houses/${houseSlug}`}
      publicViewLabel="Voir ma page publique"
      soundEnabled={soundEnabled}
      onToggleSound={handleToggleSound}
      storageKey="safihub_partner_sidebar_collapsed"
      bannerNotice={
        isAdminOverride ? (
          <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2">
            <ShieldAlert className="size-3.5" />
            <span>Mode administrateur : consultation et actions au nom du pressing</span>
          </div>
        ) : undefined
      }
    >
      {children}
    </AppShell>
  );
}
