import { Suspense } from "react";
import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseBannerData } from "@/services/house";
import { getWaitingAcceptanceCount, getHouseChecklistDerivation } from "@/dal";
import { PartnerDashboardView } from "@/components/house/dashboard/partner-dashboard-view";
import { PartnerDashboardSkeleton } from "@/components/house/dashboard/partner-dashboard-skeleton";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  return {
    title: `Tableau de bord — SafiHub Partner (${houseSlug})`,
    description: "Suivez vos commandes, vos délais d'acceptation et votre charge du jour.",
  };
}

async function PartnerDashboardContent({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  // Fetch common data shared across multiple dashboard components in parent:
  // - house: used by PartnerBanner, PartnerDashboardInteractive, and PartnerContextualActions
  // - waitingAcceptanceCount: used by PartnerDashboardInteractive, AcceptanceQueue, PartnerKpiRow, PartnerPipeline
  // - checklist: used by SetupChecklistCard
  const [bannerRes, waitingAcceptanceCount, checklist] = await Promise.all([
    getHouseBannerData(houseId),
    getWaitingAcceptanceCount(houseId),
    getHouseChecklistDerivation(houseId),
  ]);

  if (!bannerRes.ok) {
    notFound();
  }

  return (
    <PartnerDashboardView
      house={bannerRes.value}
      houseId={houseId}
      houseSlug={houseSlug}
      waitingAcceptanceCount={waitingAcceptanceCount}
      checklist={checklist}
    />
  );
}

export default function PartnerDashboardPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PartnerDashboardSkeleton />}>
      <PartnerDashboardContent params={params} />
    </Suspense>
  );
}
