"use client";

import { AlertCircle, AlertTriangle, Check, Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
}

export function HoursEditor({
  initialHours,
  waitingOrdersCount = 0,
  onScheduleChange,
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
    t("saveSuccess")
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-heading font-display">{t("weeklySchedule")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("subtitle")}</p>
        </div>

        {isDirty && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-soft text-warning border border-warning/30 self-start sm:self-auto">
            <span className="size-1.5 rounded-full bg-warning animate-ping" />
            <span>{t("unsavedChanges")}</span>
          </span>
        )}
      </div>

      <SchedulePresets
        onApplyPresetStandard={applyPresetStandard}
        onApplyToAllWeekdays={applyToAllWeekdays}
        onCopyDayToOthers={copyDayToOthers}
        disabled={isPending}
      />

      <form onSubmit={handleInitiateSave} className="space-y-4">
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
          <div className="p-3 bg-warning-soft text-warning rounded-xl border border-warning/30 text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            <span>Attention : vous devez garder au moins 1 jour ouvert pour recevoir des commandes.</span>
          </div>
        )}

        <div aria-live="polite">
          {errorMsg && (
            <div className="p-3 bg-destructive-soft text-destructive rounded-xl border border-destructive/20 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-success-soft text-success rounded-xl border border-success/30 text-xs flex items-center gap-2 font-semibold">
              <Check className="size-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            type="submit"
            disabled={isPending || !isValid || !isDirty}
            className="h-11 sm:h-10 px-5 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer min-w-36 disabled:opacity-50"
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
              N&apos;oubliez pas d&apos;enregistrer vos modifications.
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
        confirmLabel="Confirmer et enregistrer"
        cancelLabel="Annuler"
        variant="primary"
      />
    </div>
  );
}
