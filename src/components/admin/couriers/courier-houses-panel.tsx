"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  assignCourierHousesAction,
  unassignCourierHouseAction,
} from "@/actions/admin-courier.actions";
import { CourierHouseRow } from "./courier-house-row";
import { UnassignHouseDialog } from "./unassign-house-dialog";
import type { CourierAssignedHouse } from "@/services/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <UnassignHouseDialog
        isOpen={Boolean(unassignTarget)}
        house={unassignTarget}
        siblingHouses={siblingHouses}
        isPending={isPending}
        onConfirm={handleConfirmUnassign}
        onCancel={() => setUnassignTarget(null)}
      />

      {!hasShifts && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>{t("noShiftsWarning")}</p>
        </div>
      )}

      <div className="p-4 bg-card rounded-xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-heading">{t("housesTab")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("assignHousesDesc")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              type="button"
              variant={filter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterAll")} ({houses.length})
            </Button>
            <Button
              type="button"
              variant={filter === "assigned" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("assigned")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterAssigned")} ({houses.filter((h) => h.serviceStatus !== "none").length})
            </Button>
            <Button
              type="button"
              variant={filter === "unassigned" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("unassigned")}
              className="text-xs h-8 px-2.5"
            >
              {t("filterUnassigned")} ({houses.filter((h) => h.serviceStatus === "none").length})
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchHouses")}
            className="pl-8 text-xs h-8"
          />
        </div>

        {msg && (
          <div
            className={`text-xs font-semibold ${
              msg.type === "error" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {msg.text}
          </div>
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
