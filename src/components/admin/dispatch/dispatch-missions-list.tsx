"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { assignMissionAction } from "@/actions/admin-dispatch.actions";
import { Button } from "@/components/ui/button";
import type { MissionWithEligibleCouriers } from "@/services/admin";

interface DispatchMissionsListProps {
  missions: MissionWithEligibleCouriers[];
}

export function DispatchMissionsList({ missions }: DispatchMissionsListProps) {
  const t = useTranslations("admin.dispatch");
  const [loadingMissionId, setLoadingMissionId] = useState<string | null>(null);
  const [selectedCouriers, setSelectedCouriers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleAssign(mission: MissionWithEligibleCouriers) {
    const courierId = selectedCouriers[mission.id];
    if (!courierId) return;

    setLoadingMissionId(mission.id);
    setError(null);

    const fd = new FormData();
    fd.append("missionId", mission.id);
    fd.append("orderId", mission.orderId);
    fd.append("courierId", courierId);
    if (mission.customerZoneId) fd.append("customerZoneId", mission.customerZoneId);
    if (mission.houseZoneId) fd.append("houseZoneId", mission.houseZoneId);

    const res = await assignMissionAction(fd);
    setLoadingMissionId(null);

    if (!res.ok) {
      setError(res.error);
    }
  }

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#EAECF0]">
        <h2 className="text-base font-semibold text-[#101828]">
          {t("missionsTitle")} ({missions.length})
        </h2>
        <p className="text-xs text-[#667085]">
          Affectation stricte selon AC 20 (le coursier doit obligatoirement couvrir les deux zones)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-[#FEF3F2] border-b border-[#FECDCA] text-xs text-[#B42318] font-medium">
          {error}
        </div>
      )}

      <div className="divide-y divide-[#EAECF0]">
        {missions.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#667085]">
            Aucune mission en attente d&apos;assignation.
          </div>
        ) : (
          missions.map((mission) => {
            const hasEligible = mission.eligibleCouriers.length > 0;
            const currentSelected = selectedCouriers[mission.id] || "";

            return (
              <div
                key={mission.id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#F8F9FA]/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs uppercase px-2 py-0.5 rounded bg-[#2824D5]/10 text-[#2824D5]">
                      {mission.type === "pickup" ? "📦 Collecte" : "🚀 Livraison"}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#101828]">
                      #{mission.orderCode || mission.orderId.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-xs text-[#344054]">
                    Trajet:{" "}
                    <span className="font-medium text-[#101828]">
                      Zone Client ({mission.customerZoneName || "N/A"})
                    </span>{" "}
                    ↔{" "}
                    <span className="font-medium text-[#101828]">
                      Zone Pressing ({mission.houseZoneName || "N/A"})
                    </span>
                  </p>

                  <p className="text-xs text-[#667085]">
                    Créneau: {new Date(mission.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                    - {new Date(mission.slotEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {mission.landmark && ` • Repère: ${mission.landmark}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:min-w-[320px]">
                  {hasEligible ? (
                    <>
                      <select
                        value={currentSelected}
                        onChange={(e) =>
                          setSelectedCouriers((prev) => ({
                            ...prev,
                            [mission.id]: e.target.value,
                          }))
                        }
                        className="h-9 px-3 rounded-md border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:ring-1 focus:ring-[#2824D5] flex-1"
                      >
                        <option value="">Sélectionner un coursier éligible ({mission.eligibleCouriers.length})</option>
                        {mission.eligibleCouriers.map((c) => (
                          <option key={c.userId} value={c.userId}>
                            {c.name} {c.contactPhone ? `(${c.contactPhone})` : ""}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        disabled={!currentSelected || loadingMissionId === mission.id}
                        onClick={() => handleAssign(mission)}
                        className="text-xs bg-[#2824D5] hover:bg-[#1E1B9E] text-white shrink-0"
                      >
                        {loadingMissionId === mission.id ? "Assignation..." : t("assignCourier")}
                      </Button>
                    </>
                  ) : (
                    <div className="p-2 rounded bg-[#FEF3F2] border border-[#FECDCA] text-[11px] text-[#B42318] flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{t("noEligibleCouriers")}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
