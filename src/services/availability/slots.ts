import {
  compareTimes,
  timeToMinutes,
  toBukavuDateTime,
} from "./bukavu-time";

export interface HouseHourSegment {
  houseId?: string;
  weekday: number; // 1 = Monday ... 7 = Sunday
  opensAt: string; // "HH:MM" e.g. "08:00"
  closesAt: string; // "HH:MM" e.g. "18:00"
}

export interface HouseClosure {
  houseId?: string;
  startsOn: string; // "YYYY-MM-DD"
  endsOn: string; // "YYYY-MM-DD"
  reason?: string | null;
}

export interface CourierShiftSegment {
  courierId: string;
  weekday: number; // 1..7
  startsAt: string; // "HH:MM"
  endsAt: string; // "HH:MM"
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface SlotEvaluationResult {
  valid: boolean;
  reason?: string;
  code?:
    | "INVALID_DATES"
    | "HOUSE_CLOSED_DATE"
    | "OUTSIDE_OPENING_HOURS"
    | "AFTER_CUTOFF"
    | "DAILY_CAPACITY_REACHED"
    | "NO_COURIER_ON_SHIFT";
}

/**
 * Checks whether a given Bukavu local date string falls within any house closure periods.
 */
export function isDateClosed(dateString: string, closures: HouseClosure[]): boolean {
  return closures.some((c) => dateString >= c.startsOn && dateString <= c.endsOn);
}

/**
 * Checks whether a slot falls within the house's weekly hours and satisfies cutoff time.
 * Cutoff: The last pickup slot that can be booked ends cutoffMinutes before closing.
 */
export function evaluateHouseHoursAndCutoff(
  slot: TimeSlot,
  houseHours: HouseHourSegment[],
  cutoffMinutes: number
): { withinHours: boolean; withinCutoff: boolean; reason?: string } {
  const startLocal = toBukavuDateTime(slot.start);
  const endLocal = toBukavuDateTime(slot.end);

  // Slots must be within the same calendar day in Bukavu
  if (startLocal.dateString !== endLocal.dateString) {
    return {
      withinHours: false,
      withinCutoff: false,
      reason: "Pickup slot cannot span across midnight",
    };
  }

  const dayHours = houseHours.filter((h) => h.weekday === startLocal.weekday);
  if (dayHours.length === 0) {
    return {
      withinHours: false,
      withinCutoff: false,
      reason: "House is not open on this day of the week",
    };
  }

  // Check if slot falls completely inside any of the opening hour segments
  for (const segment of dayHours) {
    const opensOk = compareTimes(startLocal.timeString, segment.opensAt) >= 0;
    const closesOk = compareTimes(endLocal.timeString, segment.closesAt) <= 0;

    if (opensOk && closesOk) {
      // Check cutoff: slot end must be <= (closesAt - cutoffMinutes)
      const segmentClosesMinutes = timeToMinutes(segment.closesAt);
      const slotEndMinutes = timeToMinutes(endLocal.timeString);
      const latestAllowedEndMinutes = segmentClosesMinutes - cutoffMinutes;

      if (slotEndMinutes > latestAllowedEndMinutes) {
        return {
          withinHours: true,
          withinCutoff: false,
          reason: `Slot ends after house cutoff (${cutoffMinutes} mins before closing at ${segment.closesAt})`,
        };
      }

      return { withinHours: true, withinCutoff: true };
    }
  }

  return {
    withinHours: false,
    withinCutoff: false,
    reason: "Slot is outside the house's opening hours",
  };
}

/**
 * Checks if the house's daily order capacity has been reached for the given date.
 */
export function isDailyCapacityReached(
  dailyCapacity: number | null | undefined,
  currentOrdersCount: number
): boolean {
  if (dailyCapacity == null || dailyCapacity <= 0) return false;
  return currentOrdersCount >= dailyCapacity;
}

/**
 * Checks whether at least one active courier is on shift throughout the slot.
 */
export function hasCourierOnShift(
  slot: TimeSlot,
  courierShifts: CourierShiftSegment[]
): boolean {
  const startLocal = toBukavuDateTime(slot.start);
  const endLocal = toBukavuDateTime(slot.end);

  if (startLocal.dateString !== endLocal.dateString) return false;

  return courierShifts.some((shift) => {
    if (shift.weekday !== startLocal.weekday) return false;
    const startsOk = compareTimes(shift.startsAt, startLocal.timeString) <= 0;
    const endsOk = compareTimes(shift.endsAt, endLocal.timeString) >= 0;
    return startsOk && endsOk;
  });
}

/**
 * Evaluates the full validity of a customer pickup slot.
 */
export function evaluateSlotValidity(params: {
  slot: TimeSlot;
  houseHours: HouseHourSegment[];
  houseClosures: HouseClosure[];
  cutoffMinutes: number;
  dailyCapacity?: number | null;
  bookedOrdersByDate?: Record<string, number>;
  courierShifts: CourierShiftSegment[];
  currentTime?: Date;
  leadTimeMinutes?: number;
}): SlotEvaluationResult {
  const {
    slot,
    houseHours,
    houseClosures,
    cutoffMinutes,
    dailyCapacity,
    bookedOrdersByDate = {},
    courierShifts,
    currentTime,
    leadTimeMinutes = 0,
  } = params;

  if (
    Number.isNaN(slot.start.getTime()) ||
    Number.isNaN(slot.end.getTime()) ||
    slot.end.getTime() <= slot.start.getTime()
  ) {
    return {
      valid: false,
      code: "INVALID_DATES",
      reason: "Slot end must be after slot start",
    };
  }

  if (currentTime) {
    const minStartMs = currentTime.getTime() + (leadTimeMinutes ?? 0) * 60 * 1000;
    if (slot.start.getTime() < minStartMs) {
      return {
        valid: false,
        code: "INVALID_DATES",
        reason: "Pickup slot cannot start in the past or before configured lead time",
      };
    }
  }

  const startLocal = toBukavuDateTime(slot.start);

  if (isDateClosed(startLocal.dateString, houseClosures)) {
    return {
      valid: false,
      code: "HOUSE_CLOSED_DATE",
      reason: "House is closed on this date (holiday or closure exception)",
    };
  }

  const hoursEval = evaluateHouseHoursAndCutoff(slot, houseHours, cutoffMinutes);
  if (!hoursEval.withinHours) {
    return {
      valid: false,
      code: "OUTSIDE_OPENING_HOURS",
      reason: hoursEval.reason ?? "Slot is outside opening hours",
    };
  }

  if (!hoursEval.withinCutoff) {
    return {
      valid: false,
      code: "AFTER_CUTOFF",
      reason: hoursEval.reason ?? "Slot exceeds cutoff time",
    };
  }

  const ordersCountOnDate = bookedOrdersByDate[startLocal.dateString] ?? 0;
  if (isDailyCapacityReached(dailyCapacity, ordersCountOnDate)) {
    return {
      valid: false,
      code: "DAILY_CAPACITY_REACHED",
      reason: "House daily order capacity has been reached for this date",
    };
  }

  if (!hasCourierOnShift(slot, courierShifts)) {
    return {
      valid: false,
      code: "NO_COURIER_ON_SHIFT",
      reason: "No couriers are on shift during this slot",
    };
  }

  return { valid: true };
}
