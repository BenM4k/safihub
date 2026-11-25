"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export interface WeeklyScheduleEntry {
  weekday: number;
  start: string;
  end: string;
}

interface DayRowState {
  weekday: number;
  labelKey: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  enabled: boolean;
  start: string;
  end: string;
}

const WEEKDAY_KEYS: Array<{ weekday: number; labelKey: DayRowState["labelKey"] }> = [
  { weekday: 1, labelKey: "mon" },
  { weekday: 2, labelKey: "tue" },
  { weekday: 3, labelKey: "wed" },
  { weekday: 4, labelKey: "thu" },
  { weekday: 5, labelKey: "fri" },
  { weekday: 6, labelKey: "sat" },
  { weekday: 7, labelKey: "sun" },
];

interface WeeklyScheduleEditorProps {
  title: string;
  initialEntries: WeeklyScheduleEntry[];
  offLabel: string;
  saveLabel?: string;
  successMessage: string;
  defaultStart?: string;
  defaultEnd?: string;
  onSave: (entries: WeeklyScheduleEntry[]) => Promise<{ ok: boolean; error?: string }>;
}

export function WeeklyScheduleEditor({
  title,
  initialEntries,
  offLabel,
  saveLabel,
  successMessage,
  defaultStart = "08:00",
  defaultEnd = "18:00",
  onSave,
}: WeeklyScheduleEditorProps) {
  const t = useTranslations("admin.shared.weekdays");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(
    null
  );
  const [schedule, setSchedule] = useState<DayRowState[]>(() =>
    WEEKDAY_KEYS.map((day) => {
      const existing = initialEntries.find((entry) => entry.weekday === day.weekday);
      return {
        weekday: day.weekday,
        labelKey: day.labelKey,
        enabled: Boolean(existing),
        start: existing?.start ?? defaultStart,
        end: existing?.end ?? defaultEnd,
      };
    })
  );

  function updateDay(weekday: number, patch: Partial<Pick<DayRowState, "enabled" | "start" | "end">>) {
    setSchedule((prev) =>
      prev.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row))
    );
  }

  function handleSave() {
    setFeedback(null);
    const payload: WeeklyScheduleEntry[] = schedule
      .filter((row) => row.enabled)
      .map((row) => ({ weekday: row.weekday, start: row.start, end: row.end }));

    startTransition(async () => {
      const res = await onSave(payload);
      if (!res.ok) {
        setFeedback({ kind: "error", text: res.error || t("saveErrorFallback") });
        return;
      }
      setFeedback({ kind: "success", text: successMessage });
    });
  }

  return (
    <div className="space-y-4">
      <div className="font-bold text-sm text-heading">{title}</div>

      {feedback && (
        <Alert
          variant={feedback.kind === "error" ? "destructive" : "default"}
          className={
            feedback.kind === "success"
              ? "border-success/30 text-success bg-success-soft"
              : undefined
          }
        >
          {feedback.kind === "error" ? (
            <AlertCircle className="size-4" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          <AlertDescription className="font-semibold text-xs">
            {feedback.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="divide-y divide-border">
        {schedule.map((item) => {
          const dayLabel = t(item.labelKey);
          const switchId = `weekday-switch-${item.weekday}`;
          return (
            <div
              key={item.weekday}
              className="flex flex-wrap items-center justify-between sm:justify-start gap-3 py-2.5 text-xs"
            >
              <label
                htmlFor={switchId}
                className="w-36 flex items-center gap-2.5 font-semibold text-heading cursor-pointer min-h-11"
              >
                <Switch
                  id={switchId}
                  checked={item.enabled}
                  disabled={isPending}
                  onCheckedChange={(checked) => updateDay(item.weekday, { enabled: checked })}
                />
                <span>{dayLabel}</span>
              </label>

              {item.enabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={item.start}
                    disabled={isPending}
                    aria-label={t("startTimeLabel", { day: dayLabel })}
                    onChange={(e) => updateDay(item.weekday, { start: e.target.value })}
                    className="min-h-11 sm:min-h-9 w-32 text-base sm:text-xs"
                  />
                  <span className="text-muted-foreground">{t("to")}</span>
                  <Input
                    type="time"
                    value={item.end}
                    disabled={isPending}
                    aria-label={t("endTimeLabel", { day: dayLabel })}
                    onChange={(e) => updateDay(item.weekday, { end: e.target.value })}
                    className="min-h-11 sm:min-h-9 w-32 text-base sm:text-xs"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground italic">{offLabel}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-3">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="min-h-11 sm:min-h-9 text-xs font-semibold"
        >
          {isPending ? t("saving") : (saveLabel ?? t("saveSchedule"))}
        </Button>
      </div>
    </div>
  );
}
