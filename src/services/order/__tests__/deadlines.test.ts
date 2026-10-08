import { describe, expect, it } from "vitest";
import { fromBukavuDateTime, toBukavuDateTime, type HouseHourSegment } from "@/services/availability";
import {
  computeAcceptanceDeadlines,
  computeReceptionDeadline,
  evaluateAcceptanceJob,
  evaluateReceptionConformingJob,
  type OrderAcceptanceState,
  type OrderReceptionState,
} from "../deadlines";

describe("Opening-Hours Aware Timers & Deadlines", () => {
  // House open Monday-Saturday: 08:00 - 18:00 (closed Sunday)
  const houseHours: HouseHourSegment[] = [
    { weekday: 1, opensAt: "08:00", closesAt: "18:00" }, // Mon
    { weekday: 2, opensAt: "08:00", closesAt: "18:00" }, // Tue
    { weekday: 3, opensAt: "08:00", closesAt: "18:00" }, // Wed
    { weekday: 4, opensAt: "08:00", closesAt: "18:00" }, // Thu
    { weekday: 5, opensAt: "08:00", closesAt: "18:00" }, // Fri
    { weekday: 6, opensAt: "08:00", closesAt: "18:00" }, // Sat
  ];

  describe("AC 6: Acceptance Deadlines Crossing Closing Time", () => {
    it("computes 45-minute acceptance deadline crossing house closing time", () => {
      // Order created at 17:30 on Monday 2026-10-12
      // 30 minutes left today until closing at 18:00
      // Remaining 15 minutes roll over to Tuesday 08:00 -> Deadline is Tuesday 08:15!
      const createdAt = fromBukavuDateTime("2026-10-12", "17:30");

      const deadlines = computeAcceptanceDeadlines(createdAt, 45, houseHours, []);

      const deadlineLocal = toBukavuDateTime(deadlines.deadlineAt);
      expect(deadlineLocal.dateString).toBe("2026-10-13"); // Next day
      expect(deadlineLocal.timeString).toBe("08:15"); // 08:00 + 15 mins

      // 50% reminder (22.5 mins): 17:30 + 22.5 mins = 17:53 (rounded) on Monday
      const reminderLocal = toBukavuDateTime(deadlines.reminderAt);
      expect(reminderLocal.dateString).toBe("2026-10-12");
      expect(reminderLocal.timeString).toBe("17:53");

      // 75% escalation (33.75 mins): 30 mins Monday + 3.75 mins Tuesday = 08:04 on Tuesday
      const escalationLocal = toBukavuDateTime(deadlines.escalationAt);
      expect(escalationLocal.dateString).toBe("2026-10-13");
      expect(escalationLocal.timeString).toBe("08:04");
    });

    it("rolls over the weekend when order is created late Saturday", () => {
      // Order created Saturday 2026-10-17 at 17:45 (closes at 18:00)
      // 15 mins used Saturday. House closed Sunday.
      // Remaining 30 minutes expire on Monday morning at 08:30!
      const createdAt = fromBukavuDateTime("2026-10-17", "17:45");

      const deadlines = computeAcceptanceDeadlines(createdAt, 45, houseHours, []);

      const deadlineLocal = toBukavuDateTime(deadlines.deadlineAt);
      expect(deadlineLocal.dateString).toBe("2026-10-19"); // Monday!
      expect(deadlineLocal.timeString).toBe("08:30");
    });
  });

  describe("AC 6: Idempotent Acceptance Job Evaluator", () => {
    it("handles 50% reminder, 75% escalation, and 100% expiry idempotently", () => {
      const deadlineAt = fromBukavuDateTime("2026-10-13", "08:15");
      const reminderAt = fromBukavuDateTime("2026-10-12", "17:53");
      const escalationAt = fromBukavuDateTime("2026-10-13", "08:04");

      const orderState: OrderAcceptanceState = {
        id: "ord_1",
        status: "created",
        acceptanceDeadlineAt: deadlineAt,
        acceptanceReminderSentAt: reminderAt,
        acceptanceEscalatedAt: escalationAt,
      };

      // Before reminder time: does nothing
      const beforeNow = fromBukavuDateTime("2026-10-12", "17:40");
      expect(evaluateAcceptanceJob(orderState, beforeNow).type).toBe("none");

      // At reminder time: triggers house reminder
      const reminderNow = fromBukavuDateTime("2026-10-12", "17:55");
      expect(evaluateAcceptanceJob(orderState, reminderNow).type).toBe("remind_house");

      // At escalation time: alerts admin
      const escalationNow = fromBukavuDateTime("2026-10-13", "08:05");
      expect(evaluateAcceptanceJob(orderState, escalationNow).type).toBe("alert_admin");

      // At deadline time: expires order
      const deadlineNow = fromBukavuDateTime("2026-10-13", "08:16");
      const expireAction = evaluateAcceptanceJob(orderState, deadlineNow);
      expect(expireAction.type).toBe("expire_order");
      if (expireAction.type === "expire_order") {
        expect(expireAction.newStatus).toBe("expired");
      }
    });
  });

  describe("AC 11: 1-Hour Reception Conforming Window", () => {
    it("computes 1-hour reception deadline", () => {
      // Received Monday 10:00 -> Deadline is Monday 11:00
      const receivedAt = fromBukavuDateTime("2026-10-12", "10:00");
      const deadline = computeReceptionDeadline(receivedAt, 60, houseHours, []);

      const local = toBukavuDateTime(deadline);
      expect(local.dateString).toBe("2026-10-12");
      expect(local.timeString).toBe("11:00");
    });

    it("AC 11: automatically marks conforming after 1 hour with no reported discrepancy exactly once", () => {
      const deadlineAt = fromBukavuDateTime("2026-10-12", "11:00");
      const orderState: OrderReceptionState = {
        id: "ord_reception_1",
        status: "received",
        receivedAt: fromBukavuDateTime("2026-10-12", "10:00"),
        receptionDeadlineAt: deadlineAt,
        receptionConfirmedAt: null,
      };

      // Before deadline: does nothing
      const beforeNow = fromBukavuDateTime("2026-10-12", "10:45");
      expect(evaluateReceptionConformingJob(orderState, beforeNow).type).toBe("none");

      // After 1 hour deadline: auto-conforms and transitions to washing
      const afterNow = fromBukavuDateTime("2026-10-12", "11:05");
      const conformAction = evaluateReceptionConformingJob(orderState, afterNow);
      expect(conformAction.type).toBe("conform_order");
      if (conformAction.type === "conform_order") {
        expect(conformAction.newStatus).toBe("washing");
      }

      // Re-running after confirmation: does nothing (idempotent exactly once!)
      const confirmedState: OrderReceptionState = {
        ...orderState,
        receptionConfirmedAt: afterNow,
      };
      expect(evaluateReceptionConformingJob(confirmedState, afterNow).type).toBe("none");
    });

    it("does not auto-conform if a discrepancy has been reported", () => {
      const deadlineAt = fromBukavuDateTime("2026-10-12", "11:00");
      const orderWithDiscrepancy: OrderReceptionState = {
        id: "ord_reception_disc",
        status: "received",
        receivedAt: fromBukavuDateTime("2026-10-12", "10:00"),
        receptionDeadlineAt: deadlineAt,
        receptionConfirmedAt: null,
        hasReportedDiscrepancy: true,
      };

      const afterNow = fromBukavuDateTime("2026-10-12", "11:05");
      expect(evaluateReceptionConformingJob(orderWithDiscrepancy, afterNow).type).toBe("none");
    });
  });
});
