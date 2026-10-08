"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CourierDetailFull } from "@/services/admin";
import { CourierProfileForm } from "./courier-profile-form";
import { CourierShiftsForm } from "./courier-shifts-form";
import { CourierZonesForm } from "./courier-zones-form";
import { cn } from "@/lib/utils";

interface CourierDetailTabsProps {
  data: CourierDetailFull;
}

export function CourierDetailTabs({ data }: CourierDetailTabsProps) {
  const t = useTranslations("admin.couriers");
  const [tab, setTab] = useState<"profile" | "shifts" | "zones">("profile");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab("profile")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "profile" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("profileTab")}
        </button>
        <button
          onClick={() => setTab("shifts")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "shifts" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("shiftsTab")} ({data.shifts.length})
        </button>
        <button
          onClick={() => setTab("zones")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "zones" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("zonesTab")} ({data.zones.length})
        </button>
      </div>

      {tab === "profile" && <CourierProfileForm courier={data.courier} />}
      {tab === "shifts" && <CourierShiftsForm courierId={data.courier.userId} shifts={data.shifts} />}
      {tab === "zones" && (
        <CourierZonesForm
          courierId={data.courier.userId}
          coveredZones={data.zones}
          allZones={data.allZones}
        />
      )}
    </div>
  );
}
