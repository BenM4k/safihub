"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CourierDetailFull } from "@/services/admin";
import { CourierProfileForm } from "./courier-profile-form";
import { CourierShiftsForm } from "./courier-shifts-form";
import { CourierZonesForm } from "./courier-zones-form";
import { CourierHousesPanel } from "./courier-houses-panel";
import { cn } from "@/lib/utils";

interface CourierDetailTabsProps {
  data: CourierDetailFull;
}

export function CourierDetailTabs({ data }: CourierDetailTabsProps) {
  const t = useTranslations("admin.couriers");
  const [tab, setTab] = useState<"profile" | "shifts" | "zones" | "houses">("houses");

  const servedHousesCount =
    data.houses?.filter((h) => h.serviceStatus !== "none").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setTab("houses")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
            tab === "houses"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("housesTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "houses"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {servedHousesCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap cursor-pointer",
            tab === "profile"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          {t("profileTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("shifts")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
            tab === "shifts"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("shiftsTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "shifts"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {data.shifts.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("zones")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
            tab === "zones"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("zonesTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "zones"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {data.zones.length}
          </span>
        </button>
      </div>

      {tab === "houses" && (
        <CourierHousesPanel
          courierId={data.courier.userId}
          houses={data.houses || []}
          hasShifts={data.shifts.length > 0}
        />
      )}
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
