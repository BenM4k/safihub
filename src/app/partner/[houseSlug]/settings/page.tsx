import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import {
  getMasterItems,
  getMasterFabrics,
  getHouseCatalogueItems,
  getHouseStaff,
  getUserActiveSessions,
} from "@/dal";
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
      <div className="p-6 bg-destructive-soft text-destructive rounded-2xl border border-destructive/30 text-sm">
        {settingsRes.error}
      </div>
    );
  }

  const { house, exclusions, todayOrdersCount } = settingsRes.value;

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
    />
  );
}
