import "server-only";

import {
  getHouseTodayOrdersCount,
  getHouseExclusions,
  getMasterItems,
  getMasterFabrics,
  getHouseCatalogueItems,
  getHouseStaff,
  getUserActiveSessions,
  type HouseRecord,
} from "@/dal";
import { getNextPayoutDate } from "@/dal/partner-settlements.dal";
import type { AuthenticatedUser } from "@/services/auth";
import { CommandesTab } from "./commandes-tab";
import { ProfilTab } from "./profil-tab";
import { ExclusionsTab } from "./exclusions-tab";
import { PaiementTab } from "./paiement-tab";
import { NotificationsTab } from "./notifications-tab";
import { EquipeTab } from "./equipe-tab";
import { SecuriteTab } from "./securite-tab";
import { PreferencesTab } from "./preferences-tab";
import type { SettingsSection } from "./types";

async function CommandesTabSection({ houseId, house }: { houseId: string; house: HouseRecord }) {
  const todayOrdersCount = await getHouseTodayOrdersCount(houseId);
  return <CommandesTab house={house} todayOrdersCount={todayOrdersCount} />;
}

function ProfilTabSection({ house }: { house: HouseRecord }) {
  return <ProfilTab house={house} />;
}

async function ExclusionsTabSection({ houseId }: { houseId: string }) {
  const [exclusions, masterItems, masterFabrics, catalogueItems] = await Promise.all([
    getHouseExclusions(houseId),
    getMasterItems(),
    getMasterFabrics(),
    getHouseCatalogueItems(houseId),
  ]);

  return (
    <ExclusionsTab
      houseId={houseId}
      exclusions={exclusions}
      masterItems={masterItems}
      masterFabrics={masterFabrics}
      catalogueItems={catalogueItems}
    />
  );
}

function PaiementTabSection({ house }: { house: HouseRecord }) {
  const nextPayoutDate = getNextPayoutDate(new Date());
  return <PaiementTab house={house} nextPayoutDate={nextPayoutDate} />;
}

function NotificationsTabSection() {
  return <NotificationsTab />;
}

async function EquipeTabSection({
  houseId,
  currentUserId,
  currentUserRole,
}: {
  houseId: string;
  currentUserId: string;
  currentUserRole?: string;
}) {
  const staff = await getHouseStaff(houseId);
  return (
    <EquipeTab
      staff={staff}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
    />
  );
}

async function SecuriteTabSection({
  currentUserId,
  currentSessionId,
}: {
  currentUserId: string;
  currentSessionId?: string;
}) {
  const sessions = await getUserActiveSessions(currentUserId);
  return <SecuriteTab sessions={sessions} currentSessionId={currentSessionId} />;
}

function PreferencesTabSection() {
  return <PreferencesTab />;
}

interface SettingsTabRouterProps {
  houseId: string;
  house: HouseRecord;
  section: SettingsSection;
  user: AuthenticatedUser;
  currentSessionId?: string;
}

export async function SettingsTabRouter({
  houseId,
  house,
  section,
  user,
  currentSessionId,
}: SettingsTabRouterProps) {
  switch (section) {
    case "profil":
      return <ProfilTabSection house={house} />;
    case "exclusions":
      return <ExclusionsTabSection houseId={houseId} />;
    case "paiement":
      return <PaiementTabSection house={house} />;
    case "notifications":
      return <NotificationsTabSection />;
    case "equipe":
      return (
        <EquipeTabSection
          houseId={houseId}
          currentUserId={user.id}
          currentUserRole={user.role}
        />
      );
    case "securite":
      return (
        <SecuriteTabSection
          currentUserId={user.id}
          currentSessionId={currentSessionId}
        />
      );
    case "preferences":
      return <PreferencesTabSection />;
    case "commandes":
    default:
      return <CommandesTabSection houseId={houseId} house={house} />;
  }
}

