"use client";

import { useEffect, useState, useTransition } from "react";
import { updateHouseHoursAction } from "@/actions/house.actions";
import {
  WEEKDAY_DEFS,
  validateDayRanges,
  type DaySchedule,
  type TimeRange,
} from "@/lib/hours-utils";
import type { HouseHourRecord } from "@/dal";

export function useHoursEditorState(
  initialHours: HouseHourRecord[],
  waitingOrdersCount: number,
  onScheduleChange?: (schedule: Record<number, DaySchedule>) => void,
  saveSuccessText: string = "Horaires enregistrés avec succès."
) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(() => {
    const map: Record<number, DaySchedule> = {};
    for (const def of WEEKDAY_DEFS) {
      const matches = initialHours
        .filter((h) => h.weekday === def.weekday)
        .sort((a, b) => a.opensAt.localeCompare(b.opensAt));

      const ranges: TimeRange[] = matches.map((m) => ({
        opensAt: m.opensAt.slice(0, 5),
        closesAt: m.closesAt.slice(0, 5),
      }));

      map[def.weekday] = {
        weekday: def.weekday,
        name: def.name,
        shortName: def.shortName,
        isOpen: ranges.length > 0,
        ranges: ranges.length > 0 ? ranges : [{ opensAt: "08:00", closesAt: "18:00" }],
      };
    }
    return map;
  });

  const [initialSnapshot] = useState(() => JSON.stringify(schedule));
  const isDirty = JSON.stringify(schedule) !== initialSnapshot;

  useEffect(() => {
    onScheduleChange?.(schedule);
  }, [schedule, onScheduleChange]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleToggleOpen(weekday: number) {
    setSchedule((prev) => ({
      ...prev,
      [weekday]: { ...prev[weekday], isOpen: !prev[weekday].isOpen },
    }));
  }

  function handleUpdateRange(weekday: number, rangeIndex: number, field: "opensAt" | "closesAt", value: string) {
    setSchedule((prev) => {
      const ranges = [...prev[weekday].ranges];
      ranges[rangeIndex] = { ...ranges[rangeIndex], [field]: value };
      return {
        ...prev,
        [weekday]: { ...prev[weekday], ranges },
      };
    });
  }

  function handleAddRange(weekday: number) {
    setSchedule((prev) => {
      const ranges = [...prev[weekday].ranges];
      if (ranges.length >= 2) return prev;
      const last = ranges[0];
      const newOpen = last.closesAt < "14:00" ? "14:00" : "15:00";
      return {
        ...prev,
        [weekday]: {
          ...prev[weekday],
          ranges: [...ranges, { opensAt: newOpen, closesAt: "18:00" }],
        },
      };
    });
  }

  function handleRemoveRange(weekday: number, rangeIndex: number) {
    setSchedule((prev) => {
      const ranges = prev[weekday].ranges.filter((_, i) => i !== rangeIndex);
      return {
        ...prev,
        [weekday]: {
          ...prev[weekday],
          ranges: ranges.length > 0 ? ranges : [{ opensAt: "08:00", closesAt: "18:00" }],
        },
      };
    });
  }

  function applyPresetStandard() {
    setSchedule((prev) => {
      const next = { ...prev };
      for (const def of WEEKDAY_DEFS) {
        next[def.weekday] = {
          ...next[def.weekday],
          isOpen: def.weekday !== 7,
          ranges: [{ opensAt: "08:00", closesAt: "18:00" }],
        };
      }
      return next;
    });
  }

  function applyToAllWeekdays() {
    const monday = schedule[1];
    setSchedule((prev) => {
      const next = { ...prev };
      for (let w = 2; w <= 5; w++) {
        next[w] = {
          ...next[w],
          isOpen: monday.isOpen,
          ranges: monday.ranges.map((r) => ({ ...r })),
        };
      }
      return next;
    });
  }

  function copyDayToOthers(fromWeekday: number, targetWeekdays: number[]) {
    const source = schedule[fromWeekday];
    setSchedule((prev) => {
      const next = { ...prev };
      for (const target of targetWeekdays) {
        next[target] = {
          ...next[target],
          isOpen: source.isOpen,
          ranges: source.ranges.map((r) => ({ ...r })),
        };
      }
      return next;
    });
  }

  const hasAtLeastOneOpenDay = Object.values(schedule).some((d) => d.isOpen && d.ranges.length > 0);
  const hasRangeErrors = Object.values(schedule).some((d) => d.isOpen && validateDayRanges(d.ranges) !== null);
  const isValid = hasAtLeastOneOpenDay && !hasRangeErrors;

  function handleInitiateSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (waitingOrdersCount > 0) {
      setIsConfirmOpen(true);
    } else {
      executeSave();
    }
  }

  function executeSave() {
    setErrorMsg(null);
    setSuccessMsg(null);

    const hoursPayload: Array<{ weekday: number; opensAt: string; closesAt: string }> = [];
    for (const def of WEEKDAY_DEFS) {
      const day = schedule[def.weekday];
      if (day.isOpen) {
        for (const r of day.ranges) {
          hoursPayload.push({
            weekday: def.weekday,
            opensAt: `${r.opensAt}:00`,
            closesAt: `${r.closesAt}:00`,
          });
        }
      }
    }

    startTransition(async () => {
      const res = await updateHouseHoursAction({ hours: hoursPayload });
      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(saveSuccessText);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    });
  }

  return {
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
  };
}
