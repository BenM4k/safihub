import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  processAcceptanceTimersService,
  processReceptionConformingTimersService,
} from "../timers.service";
import type {
  PendingAcceptanceOrderRecord,
  PendingReceptionOrderRecord,
} from "@/dal";

const mocks = vi.hoisted(() => ({
  pendingAcceptance: [] as PendingAcceptanceOrderRecord[],
  pendingReception: [] as PendingReceptionOrderRecord[],
  transitionOrderStatusAtomic: vi.fn(async () => true),
  markOrderAcceptanceReminderSent: vi.fn(async () => true),
  markOrderAcceptanceEscalated: vi.fn(async () => true),
  queueEmailNotification: vi.fn(async () => {}),
  sendNotification: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getPendingAcceptanceOrders: vi.fn(async () => mocks.pendingAcceptance),
    getPendingReceptionOrders: vi.fn(async () => mocks.pendingReception),
    getSettings: vi.fn(async () => ({ acceptanceDelayMinutes: 45 })),
    getHouseHours: vi.fn(async () => [
      { id: "hh-1", houseId: "house-1", weekday: 1, opensAt: "08:00", closesAt: "18:00" },
    ]),
    getHouseClosures: vi.fn(async () => []),
    getHouseStaff: vi.fn(async () => [
      {
        houseId: "house-1",
        userId: "staff-1",
        name: "Gérant Kivu",
        email: "gerant@kivu.cd",
        role: "house",
        createdAt: new Date(),
      },
    ]),
    getAdminUsers: vi.fn(async () => [
      {
        id: "admin-1",
        name: "Admin SafiHub",
        email: "admin@safihub.cd",
        role: "admin",
        status: "active",
      },
    ]),
    transitionOrderStatusAtomic: mocks.transitionOrderStatusAtomic,
    markOrderAcceptanceReminderSent: mocks.markOrderAcceptanceReminderSent,
    markOrderAcceptanceEscalated: mocks.markOrderAcceptanceEscalated,
  };
});

vi.mock("@/services/email", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/email")>();
  return {
    ...actual,
    queueEmailNotification: mocks.queueEmailNotification,
  };
});

vi.mock("@/services/notifications", () => ({
  sendNotification: mocks.sendNotification,
}));

vi.mock("@/services/analytics", () => ({
  trackOrderExpired: vi.fn(async () => {}),
}));

function makePendingAcceptance(
  overrides: Partial<PendingAcceptanceOrderRecord>
): PendingAcceptanceOrderRecord {
  return {
    id: "ord-1",
    code: "ORD-1",
    houseId: "house-1",
    houseName: "Pressing Kivu",
    houseSlug: "pressing-kivu",
    customerId: "cust-1",
    customerName: "Amani",
    customerEmail: "amani@safihub.cd",
    customerIsGuest: false,
    contactPhone: "+243990001122",
    trackingToken: "trk-1",
    status: "created",
    createdAt: new Date("2026-10-12T06:00:00Z"),
    acceptanceDeadlineAt: new Date("2026-10-12T06:45:00Z"),
    acceptanceReminderSentAt: null,
    acceptanceEscalatedAt: null,
    ...overrides,
  };
}

describe("Order Timers Service (Acceptance & Reception Auto-Confirm)", () => {
  beforeEach(() => {
    mocks.pendingAcceptance = [];
    mocks.pendingReception = [];
    mocks.transitionOrderStatusAtomic.mockClear();
    mocks.markOrderAcceptanceReminderSent.mockClear();
    mocks.markOrderAcceptanceEscalated.mockClear();
    mocks.queueEmailNotification.mockClear();
    mocks.sendNotification.mockClear();
  });

  it("reminds at 50%, escalates at 75%, and expires created orders at 100% with email and in-app notifications", async () => {
    const createdAt = new Date("2026-10-12T06:00:00Z");

    // 1. 50% reminder to house staff
    mocks.pendingAcceptance = [makePendingAcceptance({ id: "ord-remind", code: "ORD-1", createdAt })];
    const res1 = await processAcceptanceTimersService(new Date("2026-10-12T06:25:00Z"));
    expect(res1.ok).toBe(true);
    if (res1.ok) {
      expect(res1.value).toEqual({ checked: 1, reminded: 1, escalated: 0, expired: 0 });
    }
    expect(mocks.markOrderAcceptanceReminderSent).toHaveBeenCalledWith(
      "ord-remind",
      new Date("2026-10-12T06:25:00Z")
    );
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "staff-1",
        orderId: "ord-remind",
        channel: "in_app",
        templateKey: "house_acceptance_reminder",
      })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "order_acceptance_reminder",
        orderId: "ord-remind",
        email: "gerant@kivu.cd",
      })
    );

    mocks.sendNotification.mockClear();
    mocks.queueEmailNotification.mockClear();

    // 2. 75% escalation to admins & 100% expiration to customer
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-escalate",
        code: "ORD-2",
        createdAt,
        acceptanceDeadlineAt: new Date("2026-10-12T07:00:00Z"),
        acceptanceReminderSentAt: new Date("2026-10-12T06:23:00Z"),
      }),
      makePendingAcceptance({
        id: "ord-expire",
        code: "ORD-3",
        createdAt: new Date("2026-10-12T05:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T06:30:00Z"),
      }),
    ];

    const res2 = await processAcceptanceTimersService(new Date("2026-10-12T06:35:00Z"));
    expect(res2.ok).toBe(true);
    if (res2.ok) {
      expect(res2.value).toEqual({ checked: 2, reminded: 0, escalated: 1, expired: 1 });
    }
    expect(mocks.markOrderAcceptanceEscalated).toHaveBeenCalledWith(
      "ord-escalate",
      new Date("2026-10-12T06:35:00Z")
    );
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin-1",
        orderId: "ord-escalate",
        channel: "in_app",
        templateKey: "admin_escalation_alert",
      })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "order_acceptance_escalation",
        orderId: "ord-escalate",
        email: "admin@safihub.cd",
      })
    );
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-1",
        orderId: "ord-expire",
        channel: "in_app",
        templateKey: "order_expired",
      })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "order_expired",
        orderId: "ord-expire",
        email: "amani@safihub.cd",
      })
    );
  });

  it("auto-conforms received orders past receptionDeadlineAt into washing", async () => {
    const now = new Date("2026-10-12T09:05:00Z");
    mocks.pendingReception = [
      {
        id: "ord-rec-due",
        code: "ORD-REC-1",
        houseId: "house-1",
        status: "received",
        receivedAt: new Date("2026-10-12T08:00:00Z"),
        receptionDeadlineAt: new Date("2026-10-12T09:00:00Z"),
        receptionConfirmedAt: null,
      },
      {
        id: "ord-rec-wait",
        code: "ORD-REC-2",
        houseId: "house-1",
        status: "received",
        receivedAt: new Date("2026-10-12T08:30:00Z"),
        receptionDeadlineAt: new Date("2026-10-12T09:30:00Z"),
        receptionConfirmedAt: null,
      },
    ];

    const res = await processReceptionConformingTimersService(now);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toEqual({ checked: 2, conformed: 1 });
    }
    expect(mocks.transitionOrderStatusAtomic).toHaveBeenCalledTimes(1);
    expect(mocks.transitionOrderStatusAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "ord-rec-due",
        expectedStatus: "received",
        newStatus: "washing",
        orderUpdates: { receptionConfirmedAt: now },
      })
    );
  });
});
