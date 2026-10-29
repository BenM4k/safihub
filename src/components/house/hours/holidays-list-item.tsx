"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/hours-utils";
import type { DrcYearHoliday } from "@/lib/drc-holidays";

interface HolidaysListItemProps {
  holiday: DrcYearHoliday;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function HolidaysListItem({
  holiday,
  isSelected,
  onToggle,
}: HolidaysListItemProps) {
  const t = useTranslations("house.hours");

  return (
    <label
      htmlFor={`holiday-${holiday.id}`}
      className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition cursor-pointer select-none ${
        isSelected
          ? "bg-primary-soft/40"
          : "hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Checkbox
          id={`holiday-${holiday.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(holiday.id)}
        />
        <div className="space-y-0.5 min-w-0">
          <span className="font-bold text-heading block truncate">
            {holiday.name}
          </span>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 block">
            {formatDateFr(holiday.date)}
          </span>
        </div>
      </div>

      {holiday.isPast && (
        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80 shrink-0 rounded-full">
          {t("statusPast")}
        </Badge>
      )}
    </label>
  );
}
