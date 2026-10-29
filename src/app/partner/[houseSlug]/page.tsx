import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { guardHouseRoute } from "@/services/auth";
import { getHouseDashboardData } from "@/services/house";
import { getHouseChecklistDerivation } from "@/dal";
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

  const [dashboardRes, checklist] = await Promise.all([
    getHouseDashboardData(houseId),
    getHouseChecklistDerivation(houseId),
  ]);

  if (!dashboardRes.ok) {
    return (
      <div className="p-4 sm:p-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
        <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <strong className="text-destructive font-semibold block mb-1">Erreur de chargement</strong>
          <p>{dashboardRes.error}</p>
        </div>
      </div>
    );
  }

  return (
    <PartnerDashboardView
      initialMetrics={dashboardRes.value}
      houseSlug={houseSlug}
      checklist={checklist}
    />
  );
}
