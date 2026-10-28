"use client";

import type { ReactNode } from "react";
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
import { usePartnerSound } from "./use-partner-sound";
import { PartnerHelpMenu } from "./partner-help-menu";
import { ChecklistCompactIndicator } from "./onboarding/checklist-compact-indicator";
import type { HouseChecklistDerivation, HouseMembershipInfo } from "@/dal";
import { useTranslations } from "next-intl";

interface PartnerShellProps {
  houseSlug: string;
  houseName: string;
  isPaused?: boolean;
  isAdminOverride?: boolean;
  memberships?: HouseMembershipInfo[];
  user?: AppShellUser | null;
  waitingCount?: number;
  checklist?: HouseChecklistDerivation | null;
  children: ReactNode;
}

/**
 * Main application shell for the partner workspace (/partner/[houseSlug]/*).
 */
export function PartnerShell({
  houseSlug,
  houseName,
  isPaused,
  isAdminOverride,
  memberships = [],
  user,
  waitingCount = 0,
  checklist,
  children,
}: PartnerShellProps) {
  const { soundEnabled, toggleSound } = usePartnerSound();
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
      topBarRight={<PartnerHelpMenu houseSlug={houseSlug} />}
      user={user}
      publicViewHref={`/houses/${houseSlug}`}
      publicViewLabel={tHeader("clientView")}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      storageKey="safihub_partner_sidebar_collapsed"
      sidebarFooter={
        checklist && checklist.reviewStatus !== "approved"
          ? (isCollapsed: boolean) => (
              <ChecklistCompactIndicator
                houseSlug={houseSlug}
                completedCount={checklist.completedCount}
                reviewStatus={checklist.reviewStatus}
                isCollapsed={isCollapsed}
              />
            )
          : undefined
      }
      mobileMoreExtra={
        checklist && checklist.reviewStatus !== "approved" ? (
          <ChecklistCompactIndicator
            houseSlug={houseSlug}
            completedCount={checklist.completedCount}
            reviewStatus={checklist.reviewStatus}
            isCollapsed={false}
          />
        ) : undefined
      }
      bannerNotice={
        isAdminOverride ? (
          <div className="bg-warning text-warning-foreground text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2">
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
