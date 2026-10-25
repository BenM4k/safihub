"use client";

import { CheckCircle2, AlertCircle, CircleDashed, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CourierAssignedHouse } from "@/services/admin";

interface CourierHouseRowProps {
  house: CourierAssignedHouse;
  isPending: boolean;
  onAssign: (houseId: string) => void;
  onRequestUnassign: (house: CourierAssignedHouse) => void;
}

export function CourierHouseRow({
  house,
  isPending,
  onAssign,
  onRequestUnassign,
}: CourierHouseRowProps) {
  const t = useTranslations("admin.couriers");
  const isAssigned = house.serviceStatus !== "none";

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border-strong transition">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Store className="size-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-heading">
              {house.name}
            </span>
            <span className="text-xs text-muted-foreground">
              • {house.neighborhoodName} ({house.zoneName})
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            {house.serviceStatus === "full" && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-2xs py-0.5 gap-1 font-semibold"
              >
                <CheckCircle2 className="size-3" />
                <span>{t("statusFull")}</span>
              </Badge>
            )}

            {house.serviceStatus === "partial" && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-2xs py-0.5 gap-1 font-semibold"
              >
                <AlertCircle className="size-3" />
                <span>
                  {t("statusPartial", { missing: house.missingZoneCount })}
                </span>
              </Badge>
            )}

            {house.serviceStatus === "none" && (
              <Badge
                variant="outline"
                className="bg-muted text-muted-foreground border-border text-2xs py-0.5 gap-1 font-normal"
              >
                <CircleDashed className="size-3" />
                <span>{t("statusNone")}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {isAssigned ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onRequestUnassign(house)}
            className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-border"
          >
            {t("unassignHouse")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isPending}
            onClick={() => onAssign(house.id)}
            className="text-xs font-bold"
          >
            {t("assignHouse")}
          </Button>
        )}
      </div>
    </div>
  );
}
