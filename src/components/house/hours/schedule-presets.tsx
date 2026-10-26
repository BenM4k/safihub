"use client";

import { useState } from "react";
import { Copy, Sparkles, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEEKDAY_DEFS } from "@/lib/hours-utils";

interface SchedulePresetsProps {
  onApplyPresetStandard: () => void;
  onApplyToAllWeekdays: () => void;
  onCopyDayToOthers: (fromWeekday: number, targetWeekdays: number[]) => void;
  disabled?: boolean;
}

export function SchedulePresets({
  onApplyPresetStandard,
  onApplyToAllWeekdays,
  onCopyDayToOthers,
  disabled = false,
}: SchedulePresetsProps) {
  const t = useTranslations("house.hours");
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState(1);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([2, 3, 4, 5]);

  function handleToggleTarget(day: number) {
    setSelectedTargets((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleExecuteCopy() {
    onCopyDayToOthers(copySourceDay, selectedTargets);
    setIsCopyOpen(false);
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground mr-1">
          {t("shortcuts")} :
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onApplyPresetStandard}
          className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground"
        >
          <Sparkles className="size-3 text-primary mr-1.5" aria-hidden="true" />
          <span>{t("presetStandard")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onApplyToAllWeekdays}
          className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground"
        >
          <span>{t("applyWeekdays")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => setIsCopyOpen((prev) => !prev)}
          className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground"
        >
          <Copy className="size-3 text-muted-foreground mr-1.5" aria-hidden="true" />
          <span>{t("copyTo")}</span>
        </Button>
      </div>

      {/* Expandable Copy Panel */}
      {isCopyOpen && (
        <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-3 text-xs animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-heading">{t("copySourcePrompt")}</span>
            <Select
              value={String(copySourceDay)}
              onValueChange={(val) => {
                const src = Number(val);
                setCopySourceDay(src);
                setSelectedTargets(WEEKDAY_DEFS.map((w) => w.weekday).filter((w) => w !== src));
              }}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_DEFS.map((w) => (
                  <SelectItem key={w.weekday} value={String(w.weekday)} className="text-xs">
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-semibold text-heading">{t("copyTargetPrompt")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {WEEKDAY_DEFS.filter((w) => w.weekday !== copySourceDay).map((w) => {
              const isSelected = selectedTargets.includes(w.weekday);
              return (
                <button
                  key={w.weekday}
                  type="button"
                  onClick={() => handleToggleTarget(w.weekday)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "text-primary font-bold border-primary/40 bg-primary-soft/30"
                      : "text-muted-foreground hover:text-foreground border-border bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="size-3 text-primary" />}
                  <span>{w.shortName}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleExecuteCopy}
              disabled={selectedTargets.length === 0}
              className="h-8 px-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs cursor-pointer"
            >
              {t("applyCopy")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCopyOpen(false)}
              className="h-8 px-2.5 text-xs text-muted-foreground cursor-pointer"
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
