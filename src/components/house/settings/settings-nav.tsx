"use client";

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
  label: string;
  description: string;
  icon: typeof Store;
}> = [
  {
    id: "profil",
    label: "Profil",
    description: "Identité, vitrine, contact et repères coursiers",
    icon: Store,
  },
  {
    id: "commandes",
    label: "Commandes",
    description: "Mise en pause, capacité quotidienne et commande minimum",
    icon: ShoppingBag,
  },
  {
    id: "exclusions",
    label: "Exclusions",
    description: "Articles et matières non traités par votre pressing",
    icon: Ban,
  },
  {
    id: "paiement",
    label: "Paiement",
    description: "Coordonnées Airtel Money, M-Pesa et modalités de versement",
    icon: Wallet,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alertes sonores et canaux push pour les commandes",
    icon: Bell,
  },
  {
    id: "equipe",
    label: "Équipe",
    description: "Membres, rôles et permissions du pressing",
    icon: Users,
  },
  {
    id: "securite",
    label: "Sécurité",
    description: "Mot de passe, 2FA et gestion des sessions actives",
    icon: KeyRound,
  },
  {
    id: "preferences",
    label: "Préférences",
    description: "Langue, fuseau horaire et zone sensible",
    icon: Globe,
  },
];

export function SettingsDesktopTabs({
  activeSection,
  onSelectSection,
  isPaused,
  exclusionsCount,
}: SettingsNavProps) {
  return (
    <nav
      aria-label="Sections des paramètres"
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
            <span>{sec.label}</span>

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
                  <span className="font-bold text-heading text-sm">{sec.label}</span>
                  {sec.id === "commandes" && isPaused && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/30">
                      En pause
                    </span>
                  )}
                  {sec.id === "exclusions" && exclusionsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                      {exclusionsCount}
                    </span>
                  )}
                  {sec.id === "equipe" && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">
                      {staffCount} membre(s)
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {sec.description}
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
