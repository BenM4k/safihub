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
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden font-sans">
      <div className="p-4 border-b border-border">
        <h2 className="text-base font-bold text-heading font-display">
          {t("missionsTitle")} ({missions.length})
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Affectation stricte selon AC 20 (le coursier doit obligatoirement couvrir les deux zones)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive-soft border-b border-destructive/20 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="divide-y divide-border">
        {missions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-xl">
              📦
            </div>
            <p className="text-sm font-bold text-heading font-display">
              {t("emptyMissions")}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t("emptyMissionsDesc")}
            </p>
          </div>
        ) : (
          missions.map((mission) => {
            const hasEligible = mission.eligibleCouriers.length > 0;
            const currentSelected = selectedCouriers[mission.id] || "";

            return (
              <div
                key={mission.id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs uppercase px-2 py-0.5 rounded bg-primary-soft text-primary-soft-foreground">
                      {mission.type === "pickup" ? "📦 Collecte" : "🚀 Livraison"}
                    </span>
                    <span className="font-mono text-xs font-semibold text-heading">
                      #{mission.orderCode || mission.orderId.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground">
                    Trajet:{" "}
                    <span className="font-medium text-heading">
                      Zone Client ({mission.customerZoneName || "N/A"})
                    </span>{" "}
                    ↔{" "}
                    <span className="font-medium text-heading">
                      Zone Pressing ({mission.houseZoneName || "N/A"})
                    </span>
                  </p>

                  <p className="text-xs text-muted-foreground">
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
                        className="h-9 px-3 rounded-md border border-border-strong bg-card text-xs text-heading focus:outline-none focus:ring-1 focus:ring-primary flex-1"
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
                        className="text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-display shrink-0 min-h-[36px]"
                      >
                        {loadingMissionId === mission.id ? "Assignation..." : t("assignCourier")}
                      </Button>
                    </>
                  ) : (
                    <div className="p-2 rounded bg-destructive-soft border border-destructive/20 text-[11px] text-destructive flex items-center gap-1.5">
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
