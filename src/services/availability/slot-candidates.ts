import { fromBukavuDateTime, toBukavuDateTime } from "./bukavu-time";
import type { TimeSlot } from "./slots";

export const STANDARD_PICKUP_SLOT_WINDOWS = [
  { startsAt: "08:00", endsAt: "10:00" },
  { startsAt: "10:00", endsAt: "12:00" },
  { startsAt: "14:00", endsAt: "16:00" },
  { startsAt: "16:00", endsAt: "18:00" },
] as const;

/**
 * Generates candidate pickup slots across multiple days in Bukavu local time (Africa/Lubumbashi).
 * Respects configured lead time (minutes from now).
 */
export function generatePickupSlotCandidates(
  referenceTime: Date,
  daysCount: number = 4,
  leadTimeMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const minStartMs = referenceTime.getTime() + Math.max(0, leadTimeMinutes) * 60 * 1000;

  // Bukavu today
  const bukavuNow = toBukavuDateTime(referenceTime);
  const baseLocalMs = Date.UTC(bukavuNow.year, bukavuNow.month - 1, bukavuNow.day);

  for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
    const currentDayMs = baseLocalMs + dayOffset * 24 * 60 * 60 * 1000;
    const currentDay = new Date(currentDayMs);
    const year = currentDay.getUTCFullYear();
    const month = (currentDay.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = currentDay.getUTCDate().toString().padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    for (const window of STANDARD_PICKUP_SLOT_WINDOWS) {
      const start = fromBukavuDateTime(dateString, window.startsAt);
      const end = fromBukavuDateTime(dateString, window.endsAt);

      if (start.getTime() >= minStartMs) {
        slots.push({ start, end });
      }
    }
  }

  return slots;
}
