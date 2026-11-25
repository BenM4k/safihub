"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Package } from "lucide-react";
import { assignMissionAction } from "@/actions/admin-dispatch.actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import type { MissionWithEligibleCouriers } from "@/services/admin";

interface DispatchMissionsListProps {
  missions: MissionWithEligibleCouriers[];
  onAssigned?: () => void;
}

const PAGE_SIZE = 10;

export function DispatchMissionsList({
  missions,
  onAssigned,
}: DispatchMissionsListProps) {
  const t = useTranslations("admin.dispatch");
  const locale = useLocale();
  const [selectedCouriers, setSelectedCouriers] = useState<Record<string, string>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  const [optimisticAssignedIds, addOptimisticAssignedId] = useOptimistic(
    [] as string[],
    (state: string[], missionId: string) => [...state, missionId]
  );

  const visibleMissions = missions.filter(
    (m) => !optimisticAssignedIds.includes(m.id)
  );
  const totalPages = Math.max(1, Math.ceil(visibleMissions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedMissions = visibleMissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleAssign(mission: MissionWithEligibleCouriers) {
    const courierId = selectedCouriers[mission.id];
    if (!courierId) return;

    setAssigningId(mission.id);
    setError(null);

    startTransition(async () => {
      addOptimisticAssignedId(mission.id);

      const fd = new FormData();
      fd.append("missionId", mission.id);
      fd.append("orderId", mission.orderId);
      fd.append("courierId", courierId);
      if (mission.customerZoneId) fd.append("customerZoneId", mission.customerZoneId);
      if (mission.houseZoneId) fd.append("houseZoneId", mission.houseZoneId);

      const res = await assignMissionAction(fd);
      setAssigningId(null);

      if (!res.ok) {
        setError(res.error);
      } else {
        onAssigned?.();
      }
    });
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString(locale, {
      timeZone: "Africa/Lubumbashi",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden font-sans">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-base font-bold text-foreground font-display">
          {t("missionsTitle")} ({visibleMissions.length})
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("missionsAc20Subtitle")}
        </p>
      </div>

      {error && (
        <div className="p-4 animate-enter-fast">
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="divide-y divide-border">
        {visibleMissions.length === 0 ? (
          <div className="p-12 text-center space-y-2 animate-enter-fast">
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
          paginatedMissions.map((mission) => {
            const hasEligible = mission.eligibleCouriers.length > 0;
            const currentSelected = selectedCouriers[mission.id] || "";
            const isBusy = assigningId === mission.id;

            return (
              <div
                key={mission.id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 row-interactive animate-enter-fast"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {mission.type === "pickup"
                        ? t("missionTypePickup")
                        : t("missionTypeDelivery")}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      #{mission.orderCode || mission.orderId.slice(0, 8)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground">
                    {t("missionRouteLabel")}{" "}
                    <span className="font-medium">
                      {t("missionZoneClient", {
                        zone: mission.customerZoneName || "N/A",
                      })}
                    </span>{" "}
                    ↔{" "}
                    <span className="font-medium">
                      {t("missionZoneHouse", {
                        zone: mission.houseZoneName || "N/A",
                      })}
                    </span>
                  </p>

                  <p className="text-xs text-muted-foreground tabular-nums">
                    {t("missionSlotLabel")}: {formatTime(mission.slotStart)} –{" "}
                    {formatTime(mission.slotEnd)}
                    {mission.landmark &&
                      ` · ${t("missionLandmarkLabel")}: ${mission.landmark}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:min-w-[320px]">
                  {hasEligible ? (
                    <>
                      <Select
                        value={currentSelected || undefined}
                        onValueChange={(val) =>
                          setSelectedCouriers((prev) => ({
                            ...prev,
                            [mission.id]: val,
                          }))
                        }
                      >
                        <SelectTrigger
                          className="min-h-11 h-11 text-xs flex-1"
                          aria-label={t("selectCourier")}
                        >
                          <SelectValue
                            placeholder={t("selectCourierWithCount", {
                              count: mission.eligibleCouriers.length,
                            })}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {mission.eligibleCouriers.map((c) => (
                            <SelectItem key={c.userId} value={c.userId}>
                              {c.name} {c.contactPhone ? `(${c.contactPhone})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={!currentSelected || isBusy}
                        onClick={() => handleAssign(mission)}
                        className="text-xs min-h-11 px-4 shrink-0 press"
                      >
                        {isBusy ? t("assigningCourier") : t("assignCourier")}
                      </Button>
                    </>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-destructive-soft text-destructive text-[11px] flex items-center gap-1.5 font-medium">
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

      <DataTablePagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={visibleMissions.length}
        onPageChange={setPage}
        hideIfSinglePage
      />
    </div>
  );
}
