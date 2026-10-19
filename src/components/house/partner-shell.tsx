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
import {
  AppShell,
  type AppShellNavGroup,
  type AppShellNavItem,
  type AppShellUser,
} from "@/components/layout/app-shell";
import { HouseSwitcher } from "./house-switcher";
import type { HouseMembershipInfo } from "@/dal";
import { useTranslations } from "next-intl";

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

function subscribeSound(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("safihub-sound-toggled", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("safihub-sound-toggled", callback);
  };
}

function getSoundSnapshot() {
  try {
    const stored = localStorage.getItem("safihub_sound_enabled");
    return stored !== "false";
  } catch {
    return true;
  }
}

function getServerSoundSnapshot() {
  return true;
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
  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getServerSoundSnapshot,
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

  const t = useTranslations("house.nav");
  const tHeader = useTranslations("house.header");
  const basePath = `/partner/${houseSlug}`;

  const sidebarGroups: AppShellNavGroup[] = [
    {
      items: [
        {
          href: basePath,
          label: t("dashboard"),
          icon: LayoutDashboard,
          exactMatch: true,
        },
        {
          href: `${basePath}/orders`,
          label: t("orders"),
          icon: ShoppingBag,
          badge: waitingCount > 0 ? waitingCount : null,
          badgeVariant: "warning",
        },
        {
          href: `${basePath}/catalogue`,
          label: t("catalogue"),
          icon: Tag,
        },
        {
          href: `${basePath}/settlements`,
          label: t("settlements"),
          icon: Wallet,
        },
      ],
    },
    {
      title: t("title"),
      items: [
        {
          href: `${basePath}/hours`,
          label: t("hours"),
          icon: Clock,
        },
        {
          href: `${basePath}/coverage`,
          label: t("coverage"),
          icon: MapPin,
        },
        {
          href: `${basePath}/settings`,
          label: t("settings"),
          icon: Settings,
        },
      ],
    },
  ];

  const mobileTabs: AppShellNavItem[] = [
    {
      href: basePath,
      label: t("dashboard"),
      icon: LayoutDashboard,
      exactMatch: true,
    },
    {
      href: `${basePath}/orders`,
      label: t("orders"),
      icon: ShoppingBag,
      badge: waitingCount > 0 ? waitingCount : null,
      badgeVariant: "warning",
    },
    {
      href: `${basePath}/catalogue`,
      label: t("catalogue"),
      icon: Tag,
    },
    {
      href: `${basePath}/settlements`,
      label: t("settlements"),
      icon: Wallet,
    },
  ];

  const moreGroups: AppShellNavGroup[] = [
    {
      title: t("title"),
      items: [
        {
          href: `${basePath}/hours`,
          label: t("hours"),
          icon: Clock,
        },
        {
          href: `${basePath}/coverage`,
          label: t("coverage"),
          icon: MapPin,
        },
        {
          href: `${basePath}/settings`,
          label: t("settings"),
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
      publicViewLabel={tHeader("clientView")}
      soundEnabled={soundEnabled}
      onToggleSound={handleToggleSound}
      storageKey="safihub_partner_sidebar_collapsed"
      bannerNotice={
        isAdminOverride ? (
          <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2">
            <ShieldAlert className="size-3.5" />
            <span>{tHeader("adminModeWarning")}</span>
          </div>
        ) : undefined
      }
    >
      {children}
    </AppShell>
  );
}
