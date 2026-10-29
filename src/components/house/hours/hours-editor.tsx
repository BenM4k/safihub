"use client";

import { AlertCircle, AlertTriangle, Check, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4 py-2 border-b border-border/60 pb-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-heading font-display tracking-tight">{t("weeklySchedule")}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{t("subtitle")}</p>
        </div>

        {isDirty && (
          <Badge variant="outline" className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/20 self-start sm:self-auto rounded-full">
            <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
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
        <div className="rounded-2xl overflow-hidden divide-y divide-border/60 shadow-xs bg-card">
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border/60 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs font-medium">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              {t("atLeastOneOpenDay")}
            </div>
          </div>
        )}

        <div aria-live="polite" className="space-y-2">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 text-xs font-bold">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}
          {successMsg && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-success-soft/30 border border-success/20 text-success flex items-start gap-3 text-xs font-bold"
            >
              <Check className="size-4 shrink-0 text-success mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <Button
            type="submit"
            disabled={isPending || !isValid || !isDirty}
            className="h-10 sm:h-9 px-6 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer w-full sm:w-auto min-w-36 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
            ) : (
              <Save className="size-4 mr-2" aria-hidden="true" />
            )}
            <span>{t("saveHours")}</span>
          </Button>

          {isDirty && (
            <span className="text-xs text-slate-600 dark:text-slate-300 hidden sm:inline">
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
