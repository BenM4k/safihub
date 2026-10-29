import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import {
  getMasterItems,
  getMasterFabrics,
  getHouseCatalogueItems,
  getHouseStaff,
  getUserActiveSessions,
} from "@/dal";
import { getNextPayoutDate } from "@/dal/partner-settlements.dal";
import { getHouseSettings } from "@/services/house";
import { SettingsContainer } from "@/components/house/settings";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export default async function PartnerSettingsPage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const [settingsRes, masterItems, masterFabrics, catalogueItems, staff, sessions] =
    await Promise.all([
      getHouseSettings(houseId),
      getMasterItems(),
      getMasterFabrics(),
      getHouseCatalogueItems(houseId),
      getHouseStaff(houseId),
      getUserActiveSessions(authCtx.user.id),
    ]);

  if (!settingsRes.ok) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-medium text-destructive">
        {settingsRes.error}
      </div>
    );
  }

  const { house, exclusions, todayOrdersCount } = settingsRes.value;
  const nextPayoutDate = getNextPayoutDate(new Date());

  return (
    <SettingsContainer
      house={house}
      exclusions={exclusions}
      masterItems={masterItems}
      masterFabrics={masterFabrics}
      catalogueItems={catalogueItems}
      staff={staff}
      todayOrdersCount={todayOrdersCount}
      sessions={sessions}
      user={authCtx.user}
      currentSessionId={authCtx.session.id}
      nextPayoutDate={nextPayoutDate}
    />
  );
}
