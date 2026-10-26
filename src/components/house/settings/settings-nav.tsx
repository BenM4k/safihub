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
import { Badge } from "@/components/ui/badge";

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
  { id: "profil", labelKey: "tabProfil", descriptionKey: "descProfil", icon: Store },
  { id: "commandes", labelKey: "tabCommandes", descriptionKey: "descCommandes", icon: ShoppingBag },
  { id: "exclusions", labelKey: "tabExclusions", descriptionKey: "descExclusions", icon: Ban },
  { id: "paiement", labelKey: "tabPaiement", descriptionKey: "descPaiement", icon: Wallet },
  { id: "notifications", labelKey: "tabNotifications", descriptionKey: "descNotifications", icon: Bell },
  { id: "equipe", labelKey: "tabEquipe", descriptionKey: "descEquipe", icon: Users },
  { id: "securite", labelKey: "tabSecurite", descriptionKey: "descSecurite", icon: KeyRound },
  { id: "preferences", labelKey: "tabPreferences", descriptionKey: "descPreferences", icon: Globe },
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
      className="hidden md:flex items-center gap-1 border-b border-border/60 pb-2 overflow-x-auto scrollbar-none"
    >
      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs transition whitespace-nowrap min-h-[40px] cursor-pointer bg-transparent border-0 shadow-none ${
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{t(sec.labelKey)}</span>

            {/* Badges */}
            {sec.id === "commandes" && isPaused && (
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            {sec.id === "exclusions" && exclusionsCount > 0 && (
              <Badge variant={isActive ? "default" : "secondary"} className="px-1.5 py-0 text-[10px]">
                {exclusionsCount}
              </Badge>
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
    <div className="md:hidden divide-y divide-border/60 border-y border-border/60">
      {SECTIONS_CONFIG.map((sec) => {
        const Icon = sec.icon;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className="w-full py-3.5 px-2 flex items-center justify-between gap-3 text-left transition hover:bg-muted/40 min-h-[52px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{t(sec.labelKey)}</span>
                  {sec.id === "commandes" && isPaused && (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      {t("inPause")}
                    </Badge>
                  )}
                  {sec.id === "exclusions" && exclusionsCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {exclusionsCount}
                    </Badge>
                  )}
                  {sec.id === "equipe" && (
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {t("staffCountBadge", { count: staffCount })}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {t(sec.descriptionKey)}
                </p>
              </div>
            </div>

            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
