import { notFound } from "next/navigation";
import { guardHouseRoute } from "@/services/auth";
import { getHouseHoursData } from "@/services/house";
import { getHouseBySlug } from "@/dal";
import { HoursPageView } from "@/components/house/hours";

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

export default async function PartnerHoursPage({ params }: PageProps) {
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
      <div className="p-6 bg-destructive-soft text-destructive rounded-2xl border border-destructive/20 text-sm">
        <h2 className="font-bold text-base mb-1">Erreur de chargement</h2>
        <p>{hoursDataRes.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <HoursPageView
        initialHours={hoursDataRes.value.hours}
        initialClosures={hoursDataRes.value.closures}
        waitingOrdersCount={hoursDataRes.value.waitingOrdersCount}
        isPaused={Boolean(house?.isPaused)}
        houseId={houseId}
      />
    </div>
  );
}
