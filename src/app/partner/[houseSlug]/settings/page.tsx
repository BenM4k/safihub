import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { guardHouseRoute } from "@/services/auth";
import { getHouseById, getHouseBySlug, getHouseExclusions, getHouseStaff } from "@/dal";
import { SettingsContainer } from "@/components/house/settings";
import { SettingsTabRouter } from "@/components/house/settings/settings-sections";
import {
  PartnerSettingsSkeleton,
  PartnerSettingsTabSkeleton,
} from "@/components/house/settings/partner-settings-skeleton";
import type { SettingsSection } from "@/components/house/settings/types";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
  searchParams?: Promise<{ section?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  const [house, t] = await Promise.all([
    getHouseBySlug(houseSlug),
    getTranslations("house.settings"),
  ]);
  const houseDisplayName = house?.name ?? houseSlug;
  return {
    title: t("metaTitle", { houseSlug: houseDisplayName }),
    description: t("metaDescription"),
  };
}

const VALID_SECTIONS = new Set<SettingsSection>([
  "profil",
  "commandes",
  "exclusions",
  "paiement",
  "notifications",
  "equipe",
  "securite",
  "preferences",
]);

async function PartnerSettingsContent({ params, searchParams }: PageProps) {
  const { houseSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawSection = resolvedSearchParams?.section;

  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  // Common data for the navigation tabs/badges
  const [house, exclusions, staff] = await Promise.all([
    getHouseById(houseId),
    getHouseExclusions(houseId),
    getHouseStaff(houseId),
  ]);

  if (!house) {
    notFound();
  }

  const activeSection: SettingsSection =
    rawSection && VALID_SECTIONS.has(rawSection as SettingsSection)
      ? (rawSection as SettingsSection)
      : "commandes";

  return (
    <SettingsContainer
      houseName={house.name}
      isPaused={house.isPaused}
      exclusionsCount={exclusions.length}
      staffCount={staff.length}
    >
      <Suspense key={activeSection} fallback={<PartnerSettingsTabSkeleton />}>
        <SettingsTabRouter
          houseId={houseId}
          house={house}
          section={activeSection}
          user={authCtx.user}
          currentSessionId={authCtx.session.id}
        />
      </Suspense>
    </SettingsContainer>
  );
}

export default function PartnerSettingsPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <div className="font-sans">
      <Suspense fallback={<PartnerSettingsSkeleton />}>
        <PartnerSettingsContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
