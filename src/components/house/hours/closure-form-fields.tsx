"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
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
            className="h-9 text-base sm:text-xs"
          />
          <span className="text-[11px] text-muted-foreground block">
            Format : {formatDateFr(startsOn) || "jj/mm/aaaa"}
          </span>
        </div>

        <div className="space-y-1.5">
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
            className="h-9 text-base sm:text-xs"
          />
          <span className="text-[11px] text-muted-foreground block">
            Format : {formatDateFr(endsOn) || "jj/mm/aaaa"}
          </span>
        </div>
      </div>

      {/* Reason Presets */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground block">
          Suggestions de motifs
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {REASON_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onReasonChange(preset === "Autre" ? "" : preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                reason === preset
                  ? "text-primary font-bold border-primary/40 bg-primary-soft/30"
                  : "bg-transparent hover:bg-muted/40 text-foreground border-border"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reason Text */}
      <div className="space-y-1.5">
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
          className="h-9 text-base sm:text-xs"
        />
      </div>

      {/* Overlap Warning */}
      {overlappingClosure && (
        <Alert variant="destructive" className="py-2.5 bg-warning-soft text-warning border-warning/30">
          <AlertTriangle className="size-4 text-warning" />
          <AlertDescription className="text-xs text-warning">
            <p className="font-bold">{t("overlapWarning")}</p>
            <p className="mt-0.5">
              Du {formatDateFr(overlappingClosure.startsOn)} au {formatDateFr(overlappingClosure.endsOn)}
              {overlappingClosure.reason ? ` (${overlappingClosure.reason})` : ""}.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Open Orders Warning */}
      {waitingOrdersCount > 0 && (
        <Alert className="py-2.5 bg-muted/30 border-border">
          <AlertCircle className="size-4 text-primary" />
          <AlertDescription className="text-xs">
            <span className="font-semibold text-heading">
              {t("pendingOrdersClosureWarning", { count: waitingOrdersCount })}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
