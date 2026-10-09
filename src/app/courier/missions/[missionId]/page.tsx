import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { guardCourierRoute } from "@/services/auth";
import { getCourierMissionDetailService } from "@/services/courier";
import { Badge } from "@/components/ui/badge";
import { PickupChecklist } from "@/components/courier/pickup-checklist";
import { DeliveryCompletionForm } from "@/components/courier/delivery-completion-form";

export default async function CourierMissionDetailPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const auth = await guardCourierRoute();

  const res = await getCourierMissionDetailService(auth.user.id, missionId);
  if (!res.ok) {
    notFound();
  }

  const [tNav, tMissions] = await Promise.all([
    getTranslations("courier.nav"),
    getTranslations("courier.missions"),
  ]);

  const detail = res.value;
  const isPickup = detail.mission.type === "pickup";

  return (
    <div className="space-y-4 pb-20">
      {/* Top Navigation & Mission Summary */}
      <div className="flex items-center justify-between">
        <Link
          href="/courier"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1 -ml-1 rounded-lg"
        >
          <ArrowLeft className="size-4" />
          <span>{tNav("missions")}</span>
        </Link>

        <Badge
          variant="outline"
          className={
            isPickup
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }
        >
          {isPickup ? tMissions("pickup") : tMissions("delivery")}
        </Badge>
      </div>

      {/* Customer & House Location Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="font-mono font-bold text-sm text-slate-900">
            {tMissions("orderTitle", { code: detail.mission.orderCode })}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {new Date(detail.mission.slotStart).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(detail.mission.slotEnd).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Customer Coordinates */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                {detail.mission.customerFirstName} • {detail.mission.customerNeighborhood}
              </p>
              <p className="text-slate-500">{detail.mission.customerLandmark}</p>
            </div>
          </div>

          {detail.mission.customerPhone && (
            <div className="flex items-center gap-2 pt-1">
              <Phone className="size-3.5 text-emerald-600 shrink-0" />
              <a
                href={`tel:${detail.mission.customerPhone}`}
                className="text-blue-600 font-semibold hover:underline"
              >
                {detail.mission.customerPhone} ({tMissions("call")})
              </a>
            </div>
          )}
        </div>

        {/* House Coordinates */}
        <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5 text-purple-600" />
            <span className="font-semibold text-slate-800">
              {detail.mission.houseName}
            </span>
            <span className="text-slate-400">({detail.mission.houseNeighborhood})</span>
          </div>

          {detail.mission.housePhone && (
            <a
              href={`tel:${detail.mission.housePhone}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {tMissions("call")}
            </a>
          )}
        </div>
      </div>

      {/* Execution Flow by Type */}
      {isPickup ? (
        <PickupChecklist detail={detail} />
      ) : (
        <DeliveryCompletionForm detail={detail} />
      )}
    </div>
  );
}
