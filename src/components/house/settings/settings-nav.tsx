"use client";

import { useTranslations } from "next-intl";
import {
  Ban,
  Bell,
  ChevronRight,
  Globe,
  KeyRound,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import type { SettingsSection } from "./types";

interface SettingsNavProps {
  activeSection: SettingsSection;
  onSelectSection: (section: SettingsSection) => void;
  isPaused: boolean;
  exclusionsCount: number;
  staffCount: number;
}

export const SECTIONS_CONFIG: Array<{
  id: SettingsSection;
  labelKey: string;
  descriptionKey: string;
  icon: typeof Store;
}> = [
  {
    id: "profil",
    labelKey: "tabProfil",
    descriptionKey: "descProfil",
    icon: Store,
  },
  {
    id: "commandes",
    labelKey: "tabCommandes",
    descriptionKey: "descCommandes",
    icon: ShoppingBag,
  },
  {
    id: "exclusions",
    labelKey: "tabExclusions",
    descriptionKey: "descExclusions",
    icon: Ban,
  },
  {
    id: "paiement",
    labelKey: "tabPaiement",
    descriptionKey: "descPaiement",
    icon: Wallet,
  },
  {
    id: "notifications",
    labelKey: "tabNotifications",
    descriptionKey: "descNotifications",
    icon: Bell,
  },
  {
    id: "equipe",
    labelKey: "tabEquipe",
    descriptionKey: "descEquipe",
    icon: Users,
  },
  {
    id: "securite",
    labelKey: "tabSecurite",
    descriptionKey: "descSecurite",
    icon: KeyRound,
  },
  {
    id: "preferences",
    labelKey: "tabPreferences",
    descriptionKey: "descPreferences",
    icon: Globe,
  },
];

export function SettingsDesktopTabs({
  activeSection,
  onSelectSection,
  isPaused,
  exclusionsCount,
}: SettingsNavProps) {
  const t = useTranslations("house.settings");

  return (
    <nav
      aria-label={t("navAria")}
      className="hidden md:flex items-center gap-1.5 p-1 bg-surface border border-border rounded-2xl overflow-x-auto"
    >
      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[40px] ${
              isActive
                ? "bg-heading text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{t(sec.labelKey)}</span>

            {/* Badges */}
            {sec.id === "commandes" && isPaused && (
              <span className="size-2 rounded-full bg-warning animate-pulse" />
            )}
            {sec.id === "exclusions" && exclusionsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-background/20 text-background" : "bg-secondary text-foreground"
                }`}
              >
                {exclusionsCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function SettingsMobileList({
  onSelectSection,
  isPaused,
  exclusionsCount,
  staffCount,
}: Omit<SettingsNavProps, "activeSection">) {
  const t = useTranslations("house.settings");

  return (
    <div className="md:hidden space-y-2">
      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className="w-full p-4 rounded-2xl bg-card border border-border shadow-2xs hover:bg-surface flex items-center justify-between gap-3 text-left transition min-h-[56px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-heading text-sm">{t(sec.labelKey)}</span>
                  {sec.id === "commandes" && isPaused && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/30">
                      {t("inPause")}
                    </span>
                  )}
                  {sec.id === "exclusions" && exclusionsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                      {exclusionsCount}
                    </span>
                  )}
                  {sec.id === "equipe" && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                      {t("staffCountBadge", { count: staffCount })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {t(sec.descriptionKey)}
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 text-muted-foreground shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
