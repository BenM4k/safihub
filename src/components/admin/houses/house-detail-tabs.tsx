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
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap",
            tab === "profile"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          {t("profileTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("hours")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap",
            tab === "hours"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          {t("hoursTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("closures")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5",
            tab === "closures"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("closuresTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "closures"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {data.closures.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("exclusions")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5",
            tab === "exclusions"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("exclusionsTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "exclusions"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {data.exclusions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("staff")}
          className={cn(
            "py-2 text-xs transition-colors whitespace-nowrap flex items-center gap-1.5",
            tab === "staff"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          )}
        >
          <span>{t("staffTab")}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
              tab === "staff"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {data.staff.length}
          </span>
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
