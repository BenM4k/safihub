"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  assignCourierHousesAction,
  unassignCourierHouseAction,
} from "@/actions/admin-courier.actions";
import { CourierHouseRow } from "./courier-house-row";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import type { CourierAssignedHouse } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UnassignHouseDialog = dynamic(
  () => import("./unassign-house-dialog").then((m) => m.UnassignHouseDialog),
  { ssr: false }
);

interface CourierHousesPanelProps {
  courierId: string;
  houses: CourierAssignedHouse[];
  hasShifts: boolean;
}

export function CourierHousesPanel({
  courierId,
  houses,
  hasShifts,
}: CourierHousesPanelProps) {
  const t = useTranslations("admin.couriers");
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Unassign dialog state
  const [unassignTarget, setUnassignTarget] = useState<CourierAssignedHouse | null>(null);

  const filteredHouses = useMemo(() => {
    return houses.filter((h) => {
      const isAssigned = h.serviceStatus !== "none";
      if (filter === "assigned" && !isAssigned) return false;
      if (filter === "unassigned" && isAssigned) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          h.name.toLowerCase().includes(q) ||
          h.neighborhoodName.toLowerCase().includes(q) ||
          h.zoneName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [houses, filter, search]);

  const siblingHouses = useMemo(() => {
    if (!unassignTarget) return [];
    return houses
      .filter(
        (h) =>
          h.id !== unassignTarget.id &&
          h.zoneId === unassignTarget.zoneId &&
          h.serviceStatus !== "none"
      )
      .map((h) => ({ id: h.id, name: h.name }));
  }, [houses, unassignTarget]);

  const handleAssign = (houseId: string) => {
    setMsg(null);
    startTransition(async () => {
      const res = await assignCourierHousesAction(courierId, [houseId]);
      if (!res.ok) {
        setMsg({ type: "error", text: res.error });
      } else {
        setMsg({ type: "success", text: t("assignSuccess") });
      }
    });
  };

  const handleConfirmUnassign = () => {
    if (!unassignTarget) return;
    setMsg(null);
    startTransition(async () => {
      const res = await unassignCourierHouseAction(courierId, unassignTarget.id);
      setUnassignTarget(null);
      if (!res.ok) {
        setMsg({ type: "error", text: res.error });
      } else {
        setMsg({ type: "success", text: t("unassignSuccess") });
      }
    });
  };

  return (
    <div className="space-y-4">
      {unassignTarget && (
        <UnassignHouseDialog
          isOpen
          house={unassignTarget}
          siblingHouses={siblingHouses}
          isPending={isPending}
          onConfirm={handleConfirmUnassign}
          onCancel={() => setUnassignTarget(null)}
        />
      )}

      {!hasShifts && (
        <Alert className="border-amber-500/30 text-amber-800 dark:text-amber-300 bg-amber-500/10">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs">{t("noShiftsWarning")}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 bg-muted/20 rounded-lg border border-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground">{t("housesTab")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("assignHousesDesc")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              type="button"
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterAll")} ({houses.length})
            </Button>
            <Button
              type="button"
              variant={filter === "assigned" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("assigned")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterAssigned")} ({houses.filter((h) => h.serviceStatus !== "none").length})
            </Button>
            <Button
              type="button"
              variant={filter === "unassigned" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unassigned")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterUnassigned")} ({houses.filter((h) => h.serviceStatus === "none").length})
            </Button>
          </div>
        </div>

        <AdminSearchInput
          value={search}
          onSearch={setSearch}
          onClear={() => setSearch("")}
          placeholder={t("searchHouses")}
          ariaLabel={t("searchHouses")}
        />

        {msg && (
          <Alert
            variant={msg.type === "error" ? "destructive" : "default"}
            className={
              msg.type === "success"
                ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                : ""
            }
          >
            {msg.type === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            <AlertDescription className="text-xs font-semibold">{msg.text}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        {filteredHouses.map((house) => (
          <CourierHouseRow
            key={house.id}
            house={house}
            isPending={isPending}
            onAssign={handleAssign}
            onRequestUnassign={(h) => setUnassignTarget(h)}
          />
        ))}
      </div>
    </div>
  );
}
