import {
  fromBukavuDateTime,
  minutesToTime,
  timeToMinutes,
  toBukavuDateTime,
} from "./bukavu-time";
import {
  evaluateSlotValidity,
  type CourierShiftSegment,
  type HouseClosure,
  type HouseHourSegment,
  type TimeSlot,
} from "./slots";

export interface FindNextSlotOptions {
  referenceTime: Date; // e.g. current server time (UTC)
  houseHours: HouseHourSegment[];
  houseClosures: HouseClosure[];
  cutoffMinutes: number;
  dailyCapacity?: number | null;
  bookedOrdersByDate?: Record<string, number>;
  courierShifts: CourierShiftSegment[];
  slotLengthMinutes?: number; // default 120 (2h)
  leadTimeMinutes?: number; // default 30 mins before first offered slot
  maxDaysSearch?: number; // default 14 days
}

/**
 * Searches forward in time (in Bukavu timezone) to find the first valid available pickup slot.
 * Properly navigates across midnight, holidays/closures, cutoff, and capacity limits.
 */
export function findNextAvailableSlot(options: FindNextSlotOptions): TimeSlot | null {
  const {
    referenceTime,
    houseHours,
    houseClosures,
    cutoffMinutes,
    dailyCapacity,
    bookedOrdersByDate = {},
    courierShifts,
    slotLengthMinutes = 120,
    leadTimeMinutes = 30,
    maxDaysSearch = 14,
  } = options;

  // Earliest candidate start time in UTC
  const earliestPossibleUtcMs = referenceTime.getTime() + leadTimeMinutes * 60 * 1000;
  const startRef = new Date(earliestPossibleUtcMs);
  const startRefLocal = toBukavuDateTime(startRef);

  // Iterate day by day starting from the reference date in Bukavu
  for (let dayOffset = 0; dayOffset < maxDaysSearch; dayOffset++) {
    const candidateDayUtcMs = startRef.getTime() + dayOffset * 24 * 60 * 60 * 1000;
    const dayLocal = toBukavuDateTime(new Date(candidateDayUtcMs));
    const dateStr = dayLocal.dateString;
    const weekday = dayLocal.weekday;

    // Check capacity for this date
    const bookedCount = bookedOrdersByDate[dateStr] ?? 0;
    if (dailyCapacity != null && dailyCapacity > 0 && bookedCount >= dailyCapacity) {
      continue;
    }

    // Find house opening segments for this weekday
    const segments = houseHours.filter((h) => h.weekday === weekday);
    if (segments.length === 0) continue;

    for (const segment of segments) {
      const segOpenMin = timeToMinutes(segment.opensAt);
      const segCloseMin = timeToMinutes(segment.closesAt);
      const latestEndMin = segCloseMin - cutoffMinutes;

      if (latestEndMin <= segOpenMin) continue;

      // Determine starting minute on this day
      let initialMinute = segOpenMin;
      if (dateStr === startRefLocal.dateString) {
        // Today: ensure slot starts after current reference time + lead time
        const currentRefMinute = timeToMinutes(startRefLocal.timeString);
        initialMinute = Math.max(segOpenMin, Math.ceil(currentRefMinute / 30) * 30);
      }

      // Test discrete slot candidate start minutes (e.g. on 30-min boundaries)
      for (let startMin = initialMinute; startMin + slotLengthMinutes <= latestEndMin; startMin += 30) {
        const slotStartTimeStr = minutesToTime(startMin);
        const slotEndTimeStr = minutesToTime(startMin + slotLengthMinutes);

        const slotStartUtc = fromBukavuDateTime(dateStr, slotStartTimeStr);
        const slotEndUtc = fromBukavuDateTime(dateStr, slotEndTimeStr);

        const candidateSlot: TimeSlot = { start: slotStartUtc, end: slotEndUtc };

        const evalResult = evaluateSlotValidity({
          slot: candidateSlot,
          houseHours,
          houseClosures,
          cutoffMinutes,
          dailyCapacity,
          bookedOrdersByDate,
          courierShifts,
          currentTime: referenceTime,
          leadTimeMinutes,
        });

        if (evalResult.valid) {
          return candidateSlot;
        }
      }
    }
  }

  return null;
}
