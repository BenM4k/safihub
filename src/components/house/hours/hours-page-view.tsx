"use client";

import { useState } from "react";
import { HoursHeader } from "./hours-header";
import { HoursEditor } from "./hours-editor";
import { ClosuresManager } from "./closures-manager";
import {
  WEEKDAY_DEFS,
  type DaySchedule,
  type ClosureItem,
  type TimeRange,
} from "@/lib/hours-utils";
import type { HouseHourRecord, HouseClosureRecord } from "@/dal";

interface HoursPageViewProps {
  initialHours: HouseHourRecord[];
  initialClosures: HouseClosureRecord[];
  waitingOrdersCount?: number;
  isPaused?: boolean;
}

export function HoursPageView({
  initialHours,
  initialClosures,
  waitingOrdersCount = 0,
  isPaused = false,
}: HoursPageViewProps) {
  // Build initial live schedule map for reactive header updates
  const [liveSchedule, setLiveSchedule] = useState<Record<number, DaySchedule>>(() => {
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

  const closuresList: ClosureItem[] = initialClosures.map((c) => ({
    id: c.id,
    startsOn: c.startsOn,
    endsOn: c.endsOn,
    reason: c.reason,
    createdAt: c.createdAt,
  }));

  return (
    <div className="space-y-6 w-full">
      {/* Header with live open/closed status, weekly total, timer rule example & preview */}
      <HoursHeader
        schedule={liveSchedule}
        closures={closuresList}
        isPaused={isPaused}
      />

      {/* Weekly schedule editor with 24h custom pickers, presets, and validation */}
      <HoursEditor
        initialHours={initialHours}
        waitingOrdersCount={waitingOrdersCount}
        onScheduleChange={setLiveSchedule}
      />

      {/* Temporary closures manager with modals, DRC holidays quick action, and collapsible past */}
      <ClosuresManager
        closures={initialClosures}
        waitingOrdersCount={waitingOrdersCount}
      />
    </div>
  );
}
