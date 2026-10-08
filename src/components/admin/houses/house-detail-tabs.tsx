"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HouseDetailFull } from "@/services/admin";
import { HouseProfileForm } from "./house-profile-form";
import { HouseHoursForm } from "./house-hours-form";
import { HouseClosuresForm } from "./house-closures-form";
import { HouseExclusionsForm } from "./house-exclusions-form";
import { HouseStaffForm } from "./house-staff-form";
import { cn } from "@/lib/utils";

interface HouseDetailTabsProps {
  data: HouseDetailFull;
}

export function HouseDetailTabs({ data }: HouseDetailTabsProps) {
  const t = useTranslations("admin.houses");
  const [tab, setTab] = useState<"profile" | "hours" | "closures" | "exclusions" | "staff">("profile");

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
          onClick={() => setTab("hours")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "hours" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("hoursTab")}
        </button>
        <button
          onClick={() => setTab("closures")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "closures" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("closuresTab")} ({data.closures.length})
        </button>
        <button
          onClick={() => setTab("exclusions")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "exclusions" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("exclusionsTab")} ({data.exclusions.length})
        </button>
        <button
          onClick={() => setTab("staff")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "staff" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("staffTab")} ({data.staff.length})
        </button>
      </div>

      {tab === "profile" && <HouseProfileForm house={data.house} neighborhoods={data.allNeighborhoods} />}
      {tab === "hours" && <HouseHoursForm houseId={data.house.id} hours={data.hours} />}
      {tab === "closures" && <HouseClosuresForm houseId={data.house.id} closures={data.closures} />}
      {tab === "exclusions" && (
        <HouseExclusionsForm
          houseId={data.house.id}
          exclusions={data.exclusions}
          masterItems={data.masterItems}
          masterFabrics={data.masterFabrics}
        />
      )}
      {tab === "staff" && <HouseStaffForm houseId={data.house.id} staff={data.staff} />}
    </div>
  );
}
