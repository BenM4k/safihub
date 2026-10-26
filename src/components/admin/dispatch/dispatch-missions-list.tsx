"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Package } from "lucide-react";
import { assignMissionAction } from "@/actions/admin-dispatch.actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <div className="rounded-xl border border-border bg-background overflow-hidden font-sans">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-base font-bold text-foreground font-display">
          {t("missionsTitle")} ({missions.length})
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Affectation stricte selon AC 20 (le coursier doit obligatoirement couvrir les deux zones)
        </p>
      </div>

      {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="divide-y divide-border">
        {missions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="size-12 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center">
              <Package className="size-6" />
            </div>
            <p className="text-sm font-bold text-foreground font-display">
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
                    <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {mission.type === "pickup" ? "Collecte" : "Livraison"}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      #{mission.orderCode || mission.orderId.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground">
                    Trajet:{" "}
                    <span className="font-medium">
                      Zone Client ({mission.customerZoneName || "N/A"})
                    </span>{" "}
                    ↔{" "}
                    <span className="font-medium">
                      Zone Pressing ({mission.houseZoneName || "N/A"})
                    </span>
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Créneau: {new Date(mission.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                    – {new Date(mission.slotEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {mission.landmark && ` · Repère: ${mission.landmark}`}
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
                        className="h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-1"
                      >
                        <option value="">Sélectionner un coursier ({mission.eligibleCouriers.length})</option>
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
                        className="text-xs h-8 px-3 shrink-0"
                      >
                        {loadingMissionId === mission.id ? "Assignation..." : t("assignCourier")}
                      </Button>
                    </>
                  ) : (
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-[11px] flex items-center gap-1.5 font-medium">
                      <AlertCircle className="size-3.5 shrink-0" />
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
