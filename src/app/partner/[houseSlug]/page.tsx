import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseDashboardData } from "@/services/house";
import { getHouseChecklistDerivation, getPartnerOnboarding } from "@/dal";
import { PartnerDashboardView } from "@/components/house/dashboard/partner-dashboard-view";

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

export default async function PartnerDashboardPage({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const [dashboardRes, checklist, onboarding] = await Promise.all([
    getHouseDashboardData(houseId),
    getHouseChecklistDerivation(houseId),
    getPartnerOnboarding(authCtx.user.id),
  ]);

  if (!dashboardRes.ok) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-3xl border border-destructive/20 text-sm font-sans">
        <h2 className="font-bold text-base mb-1">Erreur de chargement</h2>
        <p>{dashboardRes.error}</p>
      </div>
    );
  }

  return (
    <PartnerDashboardView
      initialMetrics={dashboardRes.value}
      houseSlug={houseSlug}
      checklist={checklist}
      onboarding={onboarding}
    />
  );
}
