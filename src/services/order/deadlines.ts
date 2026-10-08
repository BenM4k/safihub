import {
  fromBukavuDateTime,
  minutesToTime,
  timeToMinutes,
  toBukavuDateTime,
  type HouseClosure,
  type HouseHourSegment,
  isDateClosed,
} from "@/services/availability";
import type { OrderStatus } from "@/services/db/schema";

export interface AcceptanceDeadlines {
  reminderAt: Date; // 50% of delay
  escalationAt: Date; // 75% of delay
  deadlineAt: Date; // 100% of delay
}

export interface OrderAcceptanceState {
  id: string;
  status: OrderStatus;
  acceptanceDeadlineAt: Date | null;
  acceptanceReminderSentAt: Date | null;
  acceptanceEscalatedAt: Date | null;
}

export interface OrderReceptionState {
  id: string;
  status: OrderStatus;
  receivedAt: Date | null;
  receptionDeadlineAt: Date | null;
  receptionConfirmedAt: Date | null;
  hasReportedDiscrepancy?: boolean;
}

export type AcceptanceJobAction =
  | { type: "none" }
  | { type: "remind_house"; reminderTimestamp: Date }
  | { type: "alert_admin"; escalationTimestamp: Date }
  | { type: "expire_order"; newStatus: "expired" };

export type ReceptionJobAction =
  | { type: "none" }
  | { type: "conform_order"; newStatus: "washing"; confirmedAt: Date };

/**
 * Computes a target timestamp by adding open operating minutes, pausing outside house hours and closures.
 */
export function addOpeningHoursMinutes(
  startTime: Date,
  minutesToAdd: number,
  houseHours: HouseHourSegment[],
  houseClosures: HouseClosure[]
): Date {
  if (minutesToAdd <= 0) return new Date(startTime);

  let remainingMinutes = minutesToAdd;
  let currentUtcMs = startTime.getTime();

  // Guard against infinite loop if house has no hours configured
  if (houseHours.length === 0) {
    return new Date(currentUtcMs + minutesToAdd * 60 * 1000);
  }

  for (let safetyDay = 0; safetyDay < 30 && remainingMinutes > 0; safetyDay++) {
    const currentLocal = toBukavuDateTime(new Date(currentUtcMs));
    const dateStr = currentLocal.dateString;
    const weekday = currentLocal.weekday;

    // If day is closed (holiday or closure), advance to next calendar day at midnight
    if (isDateClosed(dateStr, houseClosures)) {
      const nextDayUtc = fromBukavuDateTime(dateStr, "00:00").getTime() + 24 * 60 * 60 * 1000;
      currentUtcMs = nextDayUtc;
      continue;
    }

    // Get segments for this weekday, sorted by opensAt
    const segments = houseHours
      .filter((h) => h.weekday === weekday)
      .sort((a, b) => timeToMinutes(a.opensAt) - timeToMinutes(b.opensAt));

    if (segments.length === 0) {
      // Not open on this weekday: jump to next day
      const nextDayUtc = fromBukavuDateTime(dateStr, "00:00").getTime() + 24 * 60 * 60 * 1000;
      currentUtcMs = nextDayUtc;
      continue;
    }

    const currentMinute = timeToMinutes(currentLocal.timeString);

    for (const segment of segments) {
      const segOpenMin = timeToMinutes(segment.opensAt);
      const segCloseMin = timeToMinutes(segment.closesAt);

      if (currentMinute < segOpenMin) {
        // Fast-forward to the opening of this segment
        currentUtcMs = fromBukavuDateTime(dateStr, segment.opensAt).getTime();
        const availableInSeg = segCloseMin - segOpenMin;

        if (remainingMinutes <= availableInSeg) {
          const finalMinute = segOpenMin + remainingMinutes;
          return fromBukavuDateTime(dateStr, minutesToTime(Math.round(finalMinute)));
        } else {
          remainingMinutes -= availableInSeg;
          currentUtcMs = fromBukavuDateTime(dateStr, segment.closesAt).getTime();
        }
      } else if (currentMinute >= segOpenMin && currentMinute < segCloseMin) {
        const availableInSeg = segCloseMin - currentMinute;

        if (remainingMinutes <= availableInSeg) {
          const finalMinute = currentMinute + remainingMinutes;
          return fromBukavuDateTime(dateStr, minutesToTime(Math.round(finalMinute)));
        } else {
          remainingMinutes -= availableInSeg;
          currentUtcMs = fromBukavuDateTime(dateStr, segment.closesAt).getTime();
        }
      }
      // If currentMinute >= segCloseMin, continues to next segment or day
    }

    // If day is finished, advance to midnight of next day
    const nextDayUtc = fromBukavuDateTime(dateStr, "00:00").getTime() + 24 * 60 * 60 * 1000;
    currentUtcMs = nextDayUtc;
  }

  return new Date(currentUtcMs);
}

/**
 * Computes acceptance deadlines (50% reminder, 75% escalation, 100% expiry) respecting house opening hours.
 */
export function computeAcceptanceDeadlines(
  createdAt: Date,
  delayMinutes: number,
  houseHours: HouseHourSegment[],
  houseClosures: HouseClosure[]
): AcceptanceDeadlines {
  const reminderAt = addOpeningHoursMinutes(createdAt, delayMinutes * 0.5, houseHours, houseClosures);
  const escalationAt = addOpeningHoursMinutes(createdAt, delayMinutes * 0.75, houseHours, houseClosures);
  const deadlineAt = addOpeningHoursMinutes(createdAt, delayMinutes, houseHours, houseClosures);

  return { reminderAt, escalationAt, deadlineAt };
}

/**
 * Computes reception conforming deadline (1 hour of opening hours) after clothing is received.
 */
export function computeReceptionDeadline(
  receivedAt: Date,
  windowMinutes: number,
  houseHours: HouseHourSegment[],
  houseClosures: HouseClosure[]
): Date {
  return addOpeningHoursMinutes(receivedAt, windowMinutes, houseHours, houseClosures);
}

/**
 * Idempotent evaluation of order acceptance escalation milestones. Ready for Inngest or cron jobs.
 */
export function evaluateAcceptanceJob(order: OrderAcceptanceState, now: Date): AcceptanceJobAction {
  if (order.status !== "created" || !order.acceptanceDeadlineAt) {
    return { type: "none" };
  }

  // 100% expiry reached?
  if (now.getTime() >= order.acceptanceDeadlineAt.getTime()) {
    return { type: "expire_order", newStatus: "expired" };
  }

  // 75% escalation reached and not recorded?
  if (order.acceptanceEscalatedAt && now.getTime() >= order.acceptanceEscalatedAt.getTime()) {
    return { type: "alert_admin", escalationTimestamp: now };
  }

  // 50% reminder reached and not recorded?
  if (order.acceptanceReminderSentAt && now.getTime() >= order.acceptanceReminderSentAt.getTime()) {
    return { type: "remind_house", reminderTimestamp: now };
  }

  return { type: "none" };
}

/**
 * Idempotent evaluation of 1-hour reception conforming window (AC 11).
 */
export function evaluateReceptionConformingJob(
  order: OrderReceptionState,
  now: Date
): ReceptionJobAction {
  if (order.status !== "received" || !order.receptionDeadlineAt) {
    return { type: "none" };
  }

  if (order.receptionConfirmedAt || order.hasReportedDiscrepancy) {
    return { type: "none" };
  }

  if (now.getTime() >= order.receptionDeadlineAt.getTime()) {
    return {
      type: "conform_order",
      newStatus: "washing",
      confirmedAt: now,
    };
  }

  return { type: "none" };
}
