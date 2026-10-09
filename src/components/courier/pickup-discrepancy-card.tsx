"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

interface PickupDiscrepancyCardProps {
  totalCounted: number;
  totalDeclared: number;
  onSiteApproved: boolean;
  onToggleApproval: (approved: boolean) => void;
}

export function PickupDiscrepancyCard({
  totalCounted,
  totalDeclared,
  onSiteApproved,
  onToggleApproval,
}: PickupDiscrepancyCardProps) {
  const t = useTranslations("courier.pickup");

  return (
    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
      <div className="flex items-start gap-2 text-amber-900 font-medium">
        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          {t("discrepancyNotice", {
            counted: totalCounted,
            declared: totalDeclared,
          })}
        </p>
      </div>

      <label className="flex items-center gap-2 pt-2 border-t border-amber-200/60 cursor-pointer">
        <input
          type="checkbox"
          checked={onSiteApproved}
          onChange={(e) => onToggleApproval(e.target.checked)}
          className="rounded text-amber-600 focus:ring-amber-500"
        />
        <span className="text-amber-950 font-semibold text-[11px]">
          {t("onSiteApproval")}
        </span>
      </label>
    </div>
  );
}
