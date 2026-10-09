"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, MapPin, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import type { CourierAssignedMissionSummary } from "@/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MissionCardProps {
  mission: CourierAssignedMissionSummary;
  onAccept?: (missionId: string) => void;
  isAccepting?: boolean;
}

export function MissionCard({
  mission,
  onAccept,
  isAccepting,
}: MissionCardProps) {
  const t = useTranslations("courier.missions");

  const isPickup = mission.type === "pickup";
  const slotFormatted = `${new Date(mission.slotStart).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(mission.slotEnd).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-3">
      {/* Top Header: Code, Type & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-800">
            #{mission.orderCode}
          </span>
          <Badge
            variant="outline"
            className={
              isPickup
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }
          >
            {isPickup ? t("pickup") : t("delivery")}
          </Badge>
        </div>

        <Badge
          variant="outline"
          className={
            mission.status === "completed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : mission.status === "in_progress"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : mission.status === "accepted"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-slate-50 text-slate-700 border-slate-200"
          }
        >
          {t(`status.${mission.status}`)}
        </Badge>
      </div>

      {/* Slot & Location */}
      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Clock className="size-3.5 text-slate-400 shrink-0" />
          <span>{slotFormatted}</span>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">
              {mission.customerNeighborhood}
            </span>
            <span className="text-slate-400 mx-1">•</span>
            <span className="text-slate-500">{mission.customerLandmark}</span>
          </div>
        </div>

        {mission.customerPhone && (
          <div className="flex items-center gap-2 pt-0.5">
            <Phone className="size-3.5 text-slate-400 shrink-0" />
            <a
              href={`tel:${mission.customerPhone}`}
              className="text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <span>{mission.customerFirstName}</span>
              <span className="text-slate-400 font-normal">
                ({mission.customerPhone})
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Action Footers */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 font-medium">
          {mission.courierPay ? (
            <span>
              {t("courierPay")}:{" "}
              <strong className="text-slate-800 font-bold">
                {mission.courierPay.toLocaleString()} CDF
              </strong>
            </span>
          ) : (
            <span>
              {t("totalDue")}:{" "}
              <strong className="text-slate-800 font-bold">
                {mission.totalDue.toLocaleString()} CDF
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mission.status === "assigned" && onAccept ? (
            <Button
              size="sm"
              onClick={() => onAccept(mission.id)}
              disabled={isAccepting}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              <span>{t("actions.accept")}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50 font-semibold"
            >
              <Link href={`/courier/missions/${mission.id}`}>
                <span>
                  {mission.status === "in_progress"
                    ? t("actions.continue")
                    : t("actions.details")}
                </span>
                <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
