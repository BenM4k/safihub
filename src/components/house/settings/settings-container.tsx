"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader, ConfirmDialog } from "@/components/shared";
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
}: SettingsPageData) {
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
    if (sec === activeSection) return;
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Page Title (Displayed once) */}
      <PageHeader
        title="Paramètres"
        subtitle={`Configuration opérationnelle et sécurité du pressing ${house.name}`}
      />

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
          <div className="mb-4">
            <button
              type="button"
              onClick={handleBackToSections}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground py-2 px-1 min-h-[44px]"
            >
              <ChevronLeft className="size-4" />
              <span>Toutes les sections</span>
            </button>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-lg font-black text-heading">
                {currentSectionConfig.label}
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
        {activeSection === "paiement" && <PaiementTab house={house} />}
        {activeSection === "notifications" && <NotificationsTab />}
        {activeSection === "equipe" && (
          <EquipeTab staff={staff} currentUserId={user.id} />
        )}
        {activeSection === "securite" && <SecuriteTab sessions={sessions} />}
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
        title="Modifications non enregistrées"
        description="Vous avez des modifications en cours qui n'ont pas été enregistrées. Si vous quittez cet onglet, vos modifications seront perdues. Souhaitez-vous continuer ?"
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Rester sur cette section"
        variant="destructive"
      />
    </div>
  );
}
