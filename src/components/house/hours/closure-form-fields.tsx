"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateFr, type ClosureItem } from "@/lib/hours-utils";

export const REASON_PRESETS = [
  "Jour férié",
  "Inventaire",
  "Travaux de maintenance",
  "Congés annuels",
  "Autre",
] as const;

interface ClosureFormFieldsProps {
  startsOn: string;
  endsOn: string;
  reason: string;
  todayIso: string;
  isEditing: boolean;
  overlappingClosure?: ClosureItem | null;
  waitingOrdersCount?: number;
  onStartsOnChange: (val: string) => void;
  onEndsOnChange: (val: string) => void;
  onReasonChange: (val: string) => void;
}

export function ClosureFormFields({
  startsOn,
  endsOn,
  reason,
  todayIso,
  isEditing,
  overlappingClosure,
  waitingOrdersCount = 0,
  onStartsOnChange,
  onEndsOnChange,
  onReasonChange,
}: ClosureFormFieldsProps) {
  const t = useTranslations("house.hours");

  return (
    <div className="space-y-4 text-xs font-sans max-w-full overflow-hidden min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="closure-starts-on" className="text-xs font-semibold text-foreground">
            {t("startsOn")}
          </Label>
          <Input
            id="closure-starts-on"
            type="date"
            required
            min={isEditing ? undefined : todayIso}
            value={startsOn}
            onChange={(e) => onStartsOnChange(e.target.value)}
            className="h-10 sm:h-9 text-base sm:text-xs rounded-lg border-input w-full min-w-0"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate">
            Format : {formatDateFr(startsOn) || "jj/mm/aaaa"}
          </span>
        </div>

        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="closure-ends-on" className="text-xs font-semibold text-foreground">
            {t("endsOn")}
          </Label>
          <Input
            id="closure-ends-on"
            type="date"
            required
            min={startsOn || todayIso}
            value={endsOn}
            onChange={(e) => onEndsOnChange(e.target.value)}
            className="h-10 sm:h-9 text-base sm:text-xs rounded-lg border-input w-full min-w-0"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-300 block truncate">
            Format : {formatDateFr(endsOn) || "jj/mm/aaaa"}
          </span>
        </div>
      </div>

      {/* Reason Presets */}
      <div className="space-y-1.5 min-w-0">
        <Label className="text-xs font-semibold text-foreground block">
          Suggestions de motifs
        </Label>
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {REASON_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onReasonChange(preset === "Autre" ? "" : preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer break-words ${
                reason === preset
                  ? "text-primary font-bold border-primary/40 bg-primary-soft/30"
                  : "bg-transparent hover:bg-muted/40 text-foreground border-border/80"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reason Text */}
      <div className="space-y-1.5 min-w-0">
        <Label htmlFor="closure-reason-input" className="text-xs font-semibold text-foreground">
          {t("reason")}
        </Label>
        <Input
          id="closure-reason-input"
          type="text"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder={t("reasonPlaceholder")}
          maxLength={100}
          className="h-10 sm:h-9 text-base sm:text-xs rounded-lg border-input w-full min-w-0"
        />
      </div>

      {/* Overlap Warning */}
      {overlappingClosure && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs font-medium break-words">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{t("overlapWarning")}</p>
            <p className="mt-0.5 leading-relaxed break-words">
              Du {formatDateFr(overlappingClosure.startsOn)} au {formatDateFr(overlappingClosure.endsOn)}
              {overlappingClosure.reason ? ` (${overlappingClosure.reason})` : ""}.
            </p>
          </div>
        </div>
      )}

      {/* Open Orders Warning */}
      {waitingOrdersCount > 0 && (
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-start gap-3 break-words">
          <AlertCircle className="size-4 shrink-0 text-primary mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-heading leading-relaxed break-words">
              {t("pendingOrdersClosureWarning", { count: waitingOrdersCount })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
