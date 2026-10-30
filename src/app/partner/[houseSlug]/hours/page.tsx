import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { guardHouseRoute } from "@/services/auth";
import { getHouseHoursData } from "@/services/house";
import { getHouseBySlug } from "@/dal";
import { HoursPageView } from "@/components/house/hours";
import { PartnerHoursSkeleton } from "@/components/house/hours/partner-hours-skeleton";

interface PageProps {
  params: Promise<{ houseSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { houseSlug } = await params;
  return {
    title: `Horaires et fermetures — SafiHub Partner (${houseSlug})`,
    description: "Gérez les horaires d'ouverture hebdomadaires et les fermetures exceptionnelles de votre pressing.",
  };
}

async function PartnerHoursContent({ params }: PageProps) {
  const { houseSlug } = await params;
  const authCtx = await guardHouseRoute({ houseSlug });
  const houseId = authCtx.houseId;

  if (!houseId) {
    notFound();
  }

  const [hoursDataRes, house] = await Promise.all([
    getHouseHoursData(houseId),
    getHouseBySlug(houseSlug),
  ]);

  if (!hoursDataRes.ok) {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 font-sans">
        <AlertCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
        <div>
          <h2 className="font-bold text-base mb-1 font-display">Erreur de chargement</h2>
          <p className="text-xs leading-relaxed">{hoursDataRes.error}</p>
        </div>
      </div>
    );
  }

  return (
    <HoursPageView
      initialHours={hoursDataRes.value.hours}
      initialClosures={hoursDataRes.value.closures}
      waitingOrdersCount={hoursDataRes.value.waitingOrdersCount}
      isPaused={Boolean(house?.isPaused)}
      houseId={houseId}
    />
  );
}

export default function PartnerHoursPage({ params }: PageProps) {
  return (
    <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-28 max-w-6xl font-sans">
      <Suspense fallback={<PartnerHoursSkeleton />}>
        <PartnerHoursContent params={params} />
      </Suspense>
    </div>
  );
}
