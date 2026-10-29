"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { ConfirmDialog } from "@/components/shared";
import {
  SettingsDesktopTabs,
  SettingsMobileList,
  SECTIONS_CONFIG,
} from "./settings-nav";
import { CommandesTab } from "./commandes-tab";
import { ExclusionsTab } from "./exclusions-tab";
import { SecuriteTab } from "./securite-tab";
import { ProfilTab } from "./profil-tab";
import { PaiementTab } from "./paiement-tab";
import { NotificationsTab } from "./notifications-tab";
import { EquipeTab } from "./equipe-tab";
import { PreferencesTab } from "./preferences-tab";
import type { SettingsPageData, SettingsSection } from "./types";

export function SettingsContainer({
  house,
  exclusions,
  masterItems,
  masterFabrics,
  catalogueItems,
  staff,
  todayOrdersCount,
  sessions,
  user,
  currentSessionId,
  nextPayoutDate,
}: SettingsPageData) {
  const t = useTranslations("house.settings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionParam = searchParams.get("section") as SettingsSection | null;
  const isSectionValid =
    sectionParam && SECTIONS_CONFIG.some((s) => s.id === sectionParam);

  const activeSection: SettingsSection = isSectionValid
    ? sectionParam
    : "commandes";
  const isMobileDetailOpen = Boolean(sectionParam && isSectionValid);

  // Unsaved changes tracking & confirmation
  const [isSectionDirty, setIsSectionDirty] = useState(false);
  const [pendingSection, setPendingSection] = useState<SettingsSection | null>(
    null,
  );

  function navigateToSection(sec: SettingsSection) {
    setIsSectionDirty(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", sec);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSelectSection(sec: SettingsSection) {
    if (sec === activeSection && (isMobileDetailOpen || sectionParam === sec)) return;
    if (isSectionDirty) {
      setPendingSection(sec);
      return;
    }
    navigateToSection(sec);
  }

  function handleBackToSections() {
    setIsSectionDirty(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("section");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentSectionConfig =
    SECTIONS_CONFIG.find((s) => s.id === activeSection) ?? SECTIONS_CONFIG[0];

  return (
    <div className="space-y-8 sm:space-y-10 max-w-6xl mx-auto pb-24 sm:pb-28">
      {/* Page Title (Displayed once) */}
      <div className="space-y-1 pb-5 border-b border-border/60">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t("subtitleWithName", { name: house.name })}
        </p>
      </div>

      {/* Desktop Tabs */}
      <SettingsDesktopTabs
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isPaused={house.isPaused}
        exclusionsCount={exclusions.length}
        staffCount={staff.length}
      />

      {/* Mobile: View List of sections or active section with back button */}
      <div className="md:hidden">
        {isMobileDetailOpen ? (
          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={handleBackToSections}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-heading py-2 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 min-h-[40px] transition cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              <span>{t("allSections")}</span>
            </button>
            <div className="flex items-center gap-2 pt-1">
              <h2 className="text-xl font-black text-heading font-display">
                {t(currentSectionConfig.labelKey)}
              </h2>
            </div>
          </div>
        ) : (
          <SettingsMobileList
            onSelectSection={handleSelectSection}
            isPaused={house.isPaused}
            exclusionsCount={exclusions.length}
            staffCount={staff.length}
          />
        )}
      </div>

      {/* Active Tab Content */}
      <div className={`${isMobileDetailOpen ? "block" : "hidden md:block"}`}>
        {activeSection === "profil" && (
          <ProfilTab house={house} onDirtyChange={setIsSectionDirty} />
        )}
        {activeSection === "commandes" && (
          <CommandesTab
            house={house}
            todayOrdersCount={todayOrdersCount}
            onDirtyChange={setIsSectionDirty}
          />
        )}
        {activeSection === "exclusions" && (
          <ExclusionsTab
            houseId={house.id}
            exclusions={exclusions}
            masterItems={masterItems}
            masterFabrics={masterFabrics}
            catalogueItems={catalogueItems}
          />
        )}
        {activeSection === "paiement" && (
          <PaiementTab house={house} nextPayoutDate={nextPayoutDate} />
        )}
        {activeSection === "notifications" && <NotificationsTab />}
        {activeSection === "equipe" && (
          <EquipeTab staff={staff} currentUserId={user.id} />
        )}
        {activeSection === "securite" && (
          <SecuriteTab sessions={sessions} currentSessionId={currentSessionId} />
        )}
        {activeSection === "preferences" && <PreferencesTab />}
      </div>

      {/* Unsaved changes confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingSection)}
        onClose={() => setPendingSection(null)}
        onConfirm={async () => {
          if (pendingSection) {
            navigateToSection(pendingSection);
            setPendingSection(null);
          }
        }}
        title={t("unsavedChangesTitle")}
        description={t("unsavedChangesDesc")}
        confirmLabel={t("discardAndLeave")}
        cancelLabel={t("stayOnSection")}
        variant="destructive"
      />
    </div>
  );
}
