"use client";

import { AlertCircle, AlertTriangle, Check, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared";
import { ScheduleRow } from "./schedule-row";
import { SchedulePresets } from "./schedule-presets";
import { useHoursEditorState } from "./use-hours-editor-state";
import { WEEKDAY_DEFS, type DaySchedule } from "@/lib/hours-utils";
import type { HouseHourRecord } from "@/dal";

interface HoursEditorProps {
  initialHours: HouseHourRecord[];
  waitingOrdersCount?: number;
  onScheduleChange?: (schedule: Record<number, DaySchedule>) => void;
  houseId?: string;
}

export function HoursEditor({
  initialHours,
  waitingOrdersCount = 0,
  onScheduleChange,
  houseId,
}: HoursEditorProps) {
  const t = useTranslations("house.hours");

  const {
    schedule,
    isPending,
    isDirty,
    errorMsg,
    successMsg,
    isValid,
    hasAtLeastOneOpenDay,
    isConfirmOpen,
    setIsConfirmOpen,
    handleToggleOpen,
    handleUpdateRange,
    handleAddRange,
    handleRemoveRange,
    applyPresetStandard,
    applyToAllWeekdays,
    copyDayToOthers,
    handleInitiateSave,
    executeSave,
  } = useHoursEditorState(
    initialHours,
    waitingOrdersCount,
    onScheduleChange,
    t("saveSuccess"),
    houseId
  );

  return (
    <div className="space-y-4 py-2 border-b border-border pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-heading font-display">{t("weeklySchedule")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("subtitle")}</p>
        </div>

        {isDirty && (
          <Badge variant="outline" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-warning-soft text-warning border-warning/30 self-start sm:self-auto">
            <span className="size-1.5 rounded-full bg-warning animate-ping" />
            <span>{t("unsavedChanges")}</span>
          </Badge>
        )}
      </div>

      <SchedulePresets
        onApplyPresetStandard={applyPresetStandard}
        onApplyToAllWeekdays={applyToAllWeekdays}
        onCopyDayToOthers={copyDayToOthers}
        disabled={isPending}
      />

      <form onSubmit={handleInitiateSave} className="space-y-4">
        <div className="border border-border/80 rounded-xl overflow-hidden divide-y divide-border/60">
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/80 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="min-w-40">{t("day")}</span>
            <div className="flex items-center gap-12 pr-6">
              <span>{t("opensAt")}</span>
              <span>{t("closesAt")}</span>
            </div>
          </div>

          {WEEKDAY_DEFS.map((def) => (
            <ScheduleRow
              key={def.weekday}
              day={schedule[def.weekday]}
              onToggleOpen={handleToggleOpen}
              onUpdateRange={handleUpdateRange}
              onAddRange={handleAddRange}
              onRemoveRange={handleRemoveRange}
              disabled={isPending}
            />
          ))}
        </div>

        {!hasAtLeastOneOpenDay && (
          <Alert variant="destructive" className="py-2.5 bg-warning-soft text-warning border-warning/30">
            <AlertTriangle className="size-4 text-warning" />
            <AlertDescription className="text-xs font-semibold text-warning">
              {t("atLeastOneOpenDay")}
            </AlertDescription>
          </Alert>
        )}

        <div aria-live="polite" className="space-y-2">
          {errorMsg && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
            </Alert>
          )}
          {successMsg && (
            <Alert className="py-2.5 bg-success-soft text-success border-success/30">
              <Check className="size-4 text-success" />
              <AlertDescription className="text-xs font-semibold text-success">{successMsg}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="submit"
            disabled={isPending || !isValid || !isDirty}
            className="h-10 px-5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer min-w-36 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
            ) : (
              <Save className="size-4 mr-2" aria-hidden="true" />
            )}
            <span>{t("saveHours")}</span>
          </Button>

          {isDirty && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t("rememberToSave")}
            </span>
          )}
        </div>
      </form>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          executeSave();
        }}
        title={t("confirmPendingOrdersTitle")}
        description={t("confirmPendingOrdersDesc", { count: waitingOrdersCount })}
        confirmLabel={t("confirmAndSave")}
        cancelLabel={t("cancel")}
        variant="primary"
      />
    </div>
  );
}
