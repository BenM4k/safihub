import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  processAcceptanceTimersService,
  processReceptionConformingTimersService,
} from "../timers.service";
import type {
  HouseClosureRecord,
  HouseHourRecord,
  HouseStaffMemberRecord,
  NotificationRecord,
  OrderAcceptanceSnapshotRecord,
  OrderTimerNotificationIntentInput,
  PendingAcceptanceOrderRecord,
  PendingReceptionOrderRecord,
  UserRecord,
} from "@/dal";

const defaultHours: HouseHourRecord[] = [
  { id: "hh-1", houseId: "house-1", weekday: 1, opensAt: "08:00", closesAt: "18:00" },
  { id: "hh-2", houseId: "house-2", weekday: 1, opensAt: "07:00", closesAt: "18:00" },
];

const defaultStaff: HouseStaffMemberRecord[] = [
  {
    houseId: "house-1",
    userId: "staff-1",
    name: "Gérant Kivu",
    email: "gerant@kivu.cd",
    role: "house",
    createdAt: new Date(),
  },
];

const defaultAdmins: Array<Partial<UserRecord> & { id: string; name: string; email: string }> = [
  {
    id: "admin-1",
    name: "Admin SafiHub",
    email: "admin@safihub.cd",
    role: "admin",
    status: "active",
    banned: false,
  },
];

function makeOutboxRecord(intent: OrderTimerNotificationIntentInput): NotificationRecord {
  return {
    id: `outbox-${intent.intentKey}`,
    userId: null,
    phone: "timer-outbox",
    orderId: intent.orderId,
    channel: "in_app",
    templateKey: `timer_outbox:${intent.milestone}`,
    locale: "fr",
    title: intent.intentKey,
    body: intent.body,
    dedupeKey: null,
    status: "pending",
    attemptCount: 0,
    nextRetryAt: null,
    error: null,
    sentAt: null,
    readAt: null,
    createdAt: new Date(),
  };
}

const mocks = vi.hoisted(() => ({
  pendingAcceptance: [] as PendingAcceptanceOrderRecord[],
  pendingReception: [] as PendingReceptionOrderRecord[],
  pendingIntents: [] as NotificationRecord[],
  recordedIntentsByKey: new Map<string, NotificationRecord>(),
  orderSnapshot: null as OrderAcceptanceSnapshotRecord | null,
  hours: null as HouseHourRecord[] | null,
  closures: [] as HouseClosureRecord[],
  staffByHouse: new Map<string, HouseStaffMemberRecord[]>(),
  admins: null as Array<Partial<UserRecord>> | null,
  transitionOrderStatusAtomic: vi.fn(
    async (params: { notificationIntent?: OrderTimerNotificationIntentInput }) => {
      if (params.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          params.notificationIntent.intentKey,
          makeOutboxRecord(params.notificationIntent)
        );
      }
      return true;
    }
  ),
  markOrderAcceptanceReminderSent: vi.fn(
    async (
      _orderId: string,
      _sentAt: Date,
      options?: { notificationIntent?: OrderTimerNotificationIntentInput }
    ) => {
      if (options?.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          options.notificationIntent.intentKey,
          makeOutboxRecord(options.notificationIntent)
        );
      }
      return true;
    }
  ),
  markOrderAcceptanceEscalated: vi.fn(
    async (
      _orderId: string,
      _escalatedAt: Date,
      options?: { notificationIntent?: OrderTimerNotificationIntentInput }
    ) => {
      if (options?.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          options.notificationIntent.intentKey,
          makeOutboxRecord(options.notificationIntent)
        );
      }
      return true;
    }
  ),
  findPendingTimerNotificationIntentByKey: vi.fn(
    async (intentKey: string) => mocks.recordedIntentsByKey.get(intentKey) ?? null
  ),
  updateTimerNotificationIntent: vi.fn<
    (
      id: string,
      updates: {
        status: "pending" | "sent" | "failed";
        body: string;
        error?: string | null;
        sentAt?: Date | null;
        attemptCount?: number;
        nextRetryAt?: Date | null;
      }
    ) => Promise<boolean>
  >(async () => true),
  queueEmailNotification: vi.fn(async () => {}),
  sendNotification: vi.fn(async () => ({ ok: true as const, value: {} as NotificationRecord })),
}));

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getPendingAcceptanceOrders: vi.fn(async () => mocks.pendingAcceptance),
    getPendingReceptionOrders: vi.fn(async () => mocks.pendingReception),
    getOrderAcceptanceSnapshot: vi.fn(async () => mocks.orderSnapshot),
    getPendingTimerNotificationIntents: vi.fn(async () => mocks.pendingIntents),
    findPendingTimerNotificationIntentByKey: mocks.findPendingTimerNotificationIntentByKey,
    updateTimerNotificationIntent: mocks.updateTimerNotificationIntent,
    getSettings: vi.fn(async () => ({
      acceptanceDelayMinutes: 45,
      receptionWindowMinutes: 60,
    })),
    getHouseHours: vi.fn(async (houseId: string) =>
      (mocks.hours ?? defaultHours).filter((h) => h.houseId === houseId)
    ),
    getHouseClosures: vi.fn(async (houseId: string) =>
      mocks.closures.filter((c) => c.houseId === houseId)
    ),
    getHouseStaff: vi.fn(
      async (houseId: string) => mocks.staffByHouse.get(houseId) ?? defaultStaff
    ),
    getAdminUsers: vi.fn(async () => mocks.admins ?? defaultAdmins),
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
    assignedAt: null,
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
    mocks.pendingIntents = [];
    mocks.recordedIntentsByKey.clear();
    mocks.orderSnapshot = null;
    mocks.hours = null;
    mocks.closures = [];
    mocks.staffByHouse = new Map();
    mocks.admins = null;
    mocks.transitionOrderStatusAtomic.mockReset().mockImplementation(async (params) => {
      if (params.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          params.notificationIntent.intentKey,
          makeOutboxRecord(params.notificationIntent)
        );
      }
      return true;
    });
    mocks.markOrderAcceptanceReminderSent.mockReset().mockImplementation(async (_id, _at, options) => {
      if (options?.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          options.notificationIntent.intentKey,
          makeOutboxRecord(options.notificationIntent)
        );
      }
      return true;
    });
    mocks.markOrderAcceptanceEscalated.mockReset().mockImplementation(async (_id, _at, options) => {
      if (options?.notificationIntent) {
        mocks.recordedIntentsByKey.set(
          options.notificationIntent.intentKey,
          makeOutboxRecord(options.notificationIntent)
        );
      }
      return true;
    });
    mocks.findPendingTimerNotificationIntentByKey
      .mockReset()
      .mockImplementation(async (intentKey: string) => mocks.recordedIntentsByKey.get(intentKey) ?? null);
    mocks.updateTimerNotificationIntent.mockReset().mockResolvedValue(true);
    mocks.queueEmailNotification.mockReset().mockResolvedValue(undefined);
    mocks.sendNotification.mockReset().mockResolvedValue({ ok: true, value: {} as NotificationRecord });
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
      new Date("2026-10-12T06:25:00Z"),
      expect.objectContaining({
        expectedHouseId: "house-1",
        expectedAcceptanceDeadlineAt: new Date("2026-10-12T06:45:00Z"),
        notificationIntent: expect.objectContaining({
          orderId: "ord-remind",
          milestone: "order_acceptance_reminder",
        }),
      })
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
        houseId: "house-2",
        houseName: "Pressing Early",
        houseSlug: "pressing-early",
        createdAt: new Date("2026-10-12T05:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T05:45:00Z"),
      }),
    ];

    const res2 = await processAcceptanceTimersService(new Date("2026-10-12T06:35:00Z"));
    expect(res2.ok).toBe(true);
    if (res2.ok) {
      expect(res2.value).toEqual({ checked: 2, reminded: 0, escalated: 1, expired: 1 });
    }
    expect(mocks.markOrderAcceptanceEscalated).toHaveBeenCalledWith(
      "ord-escalate",
      new Date("2026-10-12T06:35:00Z"),
      expect.objectContaining({
        expectedHouseId: "house-1",
        expectedAcceptanceDeadlineAt: new Date("2026-10-12T07:00:00Z"),
        notificationIntent: expect.objectContaining({
          orderId: "ord-escalate",
          milestone: "order_acceptance_escalation",
        }),
      })
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

  it("skips counter and notifications on stale snapshot after house reassignment, then notifies for house B", async () => {
    const initialCreated = new Date("2026-10-12T06:00:00Z");

    // 1. Order selected with House A, but atomic guard fails because order was reassigned to House B
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-reassign-race",
        code: "ORD-RACE",
        houseId: "house-1",
        houseName: "Pressing A",
        houseSlug: "pressing-a",
        createdAt: initialCreated,
        assignedAt: initialCreated,
        acceptanceDeadlineAt: new Date("2026-10-12T06:45:00Z"),
      }),
    ];
    mocks.markOrderAcceptanceReminderSent.mockResolvedValueOnce(false);

    const raceRes = await processAcceptanceTimersService(new Date("2026-10-12T06:25:00Z"));
    expect(raceRes.ok).toBe(true);
    if (raceRes.ok) {
      expect(raceRes.value).toEqual({ checked: 1, reminded: 0, escalated: 0, expired: 0 });
    }
    expect(mocks.sendNotification).not.toHaveBeenCalled();
    expect(mocks.queueEmailNotification).not.toHaveBeenCalled();

    // 2. Subsequent sweep sees House B with its own assignedAt -> starts milestones from assignedAt (06:30Z)
    const assignedToBAt = new Date("2026-10-12T06:30:00Z");
    mocks.hours = [
      { id: "hh-1", houseId: "house-1", weekday: 1, opensAt: "08:00", closesAt: "18:00" },
      { id: "hh-b", houseId: "house-b", weekday: 1, opensAt: "08:00", closesAt: "18:00" },
    ];
    mocks.staffByHouse.set("house-b", [
      {
        houseId: "house-b",
        userId: "staff-b",
        name: "Gérant B",
        email: "gerant-b@safihub.cd",
        role: "house",
        createdAt: new Date(),
      },
    ]);
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-reassign-race",
        code: "ORD-RACE",
        houseId: "house-b",
        houseName: "Pressing B",
        houseSlug: "pressing-b",
        createdAt: initialCreated,
        assignedAt: assignedToBAt,
        acceptanceDeadlineAt: new Date("2026-10-12T07:15:00Z"),
      }),
    ];

    // At 06:40Z (only 10m since House B assignment < 22.5m), no reminder triggers for House B yet
    const tooEarlyRes = await processAcceptanceTimersService(new Date("2026-10-12T06:40:00Z"));
    expect(tooEarlyRes.ok).toBe(true);
    if (tooEarlyRes.ok) {
      expect(tooEarlyRes.value).toEqual({ checked: 1, reminded: 0, escalated: 0, expired: 0 });
    }

    // At 06:55Z (25m since House B assignment >= 22.5m), House B receives reminder with its assignmentRevision
    const houseBRes = await processAcceptanceTimersService(new Date("2026-10-12T06:55:00Z"));
    expect(houseBRes.ok).toBe(true);
    if (houseBRes.ok) {
      expect(houseBRes.value).toEqual({ checked: 1, reminded: 1, escalated: 0, expired: 0 });
    }
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "staff-b", orderId: "ord-reassign-race" })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "order_acceptance_reminder",
        email: "gerant-b@safihub.cd",
        assignmentRevision: `house-b:${assignedToBAt.toISOString()}`,
      })
    );
  });

  it("excludes banned admins during escalation fan-out", async () => {
    mocks.admins = [
      { id: "admin-ok", name: "Active Admin", email: "ok@safihub.cd", role: "admin", status: "active", banned: false },
      { id: "admin-banned", name: "Banned Admin", email: "banned@safihub.cd", role: "admin", status: "active", banned: true },
    ];
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-esc-ban",
        code: "ORD-BAN",
        createdAt: new Date("2026-10-12T06:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T06:45:00Z"),
        acceptanceReminderSentAt: new Date("2026-10-12T06:23:00Z"),
      }),
    ];

    const res = await processAcceptanceTimersService(new Date("2026-10-12T06:35:00Z"));
    expect(res.ok).toBe(true);
    expect(mocks.sendNotification).toHaveBeenCalledTimes(1);
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "admin-ok" })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledTimes(1);
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ok@safihub.cd" })
    );
  });

  it("delays acceptance and reception expiry across temporary house closures", async () => {
    mocks.hours = [
      { id: "hh-1", houseId: "house-1", weekday: 1, opensAt: "08:00", closesAt: "18:00" },
      { id: "hh-tue", houseId: "house-1", weekday: 2, opensAt: "08:00", closesAt: "18:00" },
    ];
    // Full-day closure on Monday 2026-10-12
    mocks.closures = [
      {
        id: "clos-1",
        houseId: "house-1",
        startsOn: "2026-10-12",
        endsOn: "2026-10-12",
        reason: "Maintenance",
        createdAt: new Date("2026-10-11T00:00:00Z"),
      },
    ];

    // Order created Monday 07:00Z while closed; stored deadline without closure was Monday 07:45Z.
    // Open time only starts Tuesday 06:00Z (08:00 Bukavu), so 45m deadline becomes Tuesday 06:45Z.
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-closure",
        createdAt: new Date("2026-10-12T07:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T07:45:00Z"),
        acceptanceReminderSentAt: new Date("2026-10-13T06:23:00Z"),
        acceptanceEscalatedAt: new Date("2026-10-13T06:34:00Z"),
      }),
    ];
    const beforeClosureRes = await processAcceptanceTimersService(new Date("2026-10-13T06:30:00Z"));
    expect(beforeClosureRes.ok).toBe(true);
    if (beforeClosureRes.ok) {
      expect(beforeClosureRes.value.expired).toBe(0);
    }
    const afterClosureRes = await processAcceptanceTimersService(new Date("2026-10-13T06:45:00Z"));
    expect(afterClosureRes.ok).toBe(true);
    if (afterClosureRes.ok) {
      expect(afterClosureRes.value.expired).toBe(1);
    }

    // Same for reception auto-confirm: received Monday 07:00Z, 60m window starts Tuesday 06:00Z -> 07:00Z
    mocks.pendingAcceptance = [];
    mocks.pendingReception = [
      {
        id: "ord-rec-closure",
        code: "ORD-RC",
        houseId: "house-1",
        status: "received",
        receivedAt: new Date("2026-10-12T07:00:00Z"),
        receptionDeadlineAt: new Date("2026-10-12T08:00:00Z"),
        receptionConfirmedAt: null,
      },
    ];
    const recWaitRes = await processReceptionConformingTimersService(new Date("2026-10-13T06:45:00Z"));
    expect(recWaitRes.ok).toBe(true);
    if (recWaitRes.ok) {
      expect(recWaitRes.value.conformed).toBe(0);
    }
    const recConfirmRes = await processReceptionConformingTimersService(new Date("2026-10-13T07:00:00Z"));
    expect(recConfirmRes.ok).toBe(true);
    if (recConfirmRes.ok) {
      expect(recConfirmRes.value.conformed).toBe(1);
    }
  });

  it("retries persisted pending outbox intents independently without resending succeeded recipients", async () => {
    mocks.pendingIntents = [
      {
        id: "outbox-1",
        userId: null,
        phone: "timer-outbox",
        orderId: "ord-outbox",
        channel: "in_app",
        templateKey: "timer_outbox:order_acceptance_reminder",
        locale: "fr",
        title: "ord-outbox:order_acceptance_reminder:house-1:2026-10-12T06:00:00.000Z",
        body: JSON.stringify({
          milestone: "order_acceptance_reminder",
          orderId: "ord-outbox",
          orderCode: "ORD-OUT",
          houseId: "house-1",
          houseName: "Pressing Kivu",
          houseSlug: "pressing-kivu",
          customerId: "cust-1",
          customerName: "Amani",
          customerEmail: "amani@safihub.cd",
          customerIsGuest: false,
          contactPhone: "+243990001122",
          trackingToken: "trk-out",
          assignmentRevision: "house-1:2026-10-12T06:00:00.000Z",
          completedDeliveryKeys: [],
        }),
        status: "pending",
        error: null,
        sentAt: null,
        readAt: null,
        createdAt: new Date(),
      },
    ];

    // First attempt: order is still created with matching assignment revision; in-app returns fulfilled Err, email succeeds
    mocks.orderSnapshot = {
      id: "ord-outbox",
      status: "created",
      houseId: "house-1",
      createdAt: new Date("2026-10-12T06:00:00Z"),
      assignedAt: new Date("2026-10-12T06:00:00Z"),
    };
    mocks.sendNotification.mockResolvedValueOnce({ ok: false, error: "DB write failed" } as unknown as {
      ok: true;
      value: NotificationRecord;
    });
    const resFail = await processAcceptanceTimersService(new Date("2026-10-12T06:25:00Z"));
    expect(resFail.ok).toBe(true);
    expect(mocks.updateTimerNotificationIntent).toHaveBeenCalledWith(
      "outbox-1",
      expect.objectContaining({
        status: "failed",
        error: "DB write failed",
        attemptCount: 1,
        nextRetryAt: new Date("2026-10-12T06:26:00Z"),
      })
    );

    const savedBody = mocks.updateTimerNotificationIntent.mock.calls[0]![1].body;
    expect(JSON.parse(savedBody).completedDeliveryKeys).toEqual([
      "email:remind:ord-outbox:house-1:2026-10-12T06:00:00.000Z:gerant@kivu.cd",
    ]);

    // Second sweep retries ONLY the failed in-app notification with deterministic dedupeKey, skipping the already-sent email
    mocks.pendingIntents[0]!.body = savedBody;
    mocks.pendingIntents[0]!.status = "failed";
    mocks.pendingIntents[0]!.attemptCount = 1;
    mocks.sendNotification.mockClear();
    mocks.queueEmailNotification.mockClear();
    mocks.updateTimerNotificationIntent.mockClear();
    mocks.sendNotification.mockResolvedValueOnce({ ok: true, value: {} as NotificationRecord });

    await processAcceptanceTimersService(new Date("2026-10-12T06:30:00Z"));
    expect(mocks.sendNotification).toHaveBeenCalledTimes(1);
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        dedupeKey: "in_app:remind:ord-outbox:house-1:2026-10-12T06:00:00.000Z:staff-1",
      })
    );
    expect(mocks.queueEmailNotification).not.toHaveBeenCalled();
    expect(mocks.updateTimerNotificationIntent).toHaveBeenCalledWith(
      "outbox-1",
      expect.objectContaining({ status: "sent", error: null, nextRetryAt: null })
    );
  });

  it("defers acceptance and reception transitions when no deadline fits within 30 days", async () => {
    mocks.closures = [
      {
        id: "clos-long",
        houseId: "house-1",
        startsOn: "2026-10-12",
        endsOn: "2026-12-31",
        reason: "Extended renovation",
        createdAt: new Date("2026-10-11T00:00:00Z"),
      },
    ];
    mocks.pendingAcceptance = [
      makePendingAcceptance({
        id: "ord-long-close",
        createdAt: new Date("2026-10-12T06:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T06:45:00Z"),
      }),
    ];
    mocks.pendingReception = [
      {
        id: "ord-rec-long-close",
        code: "ORD-RLC",
        houseId: "house-1",
        status: "received",
        receivedAt: new Date("2026-10-12T06:00:00Z"),
        receptionDeadlineAt: new Date("2026-10-12T07:00:00Z"),
        receptionConfirmedAt: null,
      },
    ];

    const accRes = await processAcceptanceTimersService(new Date("2026-11-20T12:00:00Z"));
    expect(accRes.ok).toBe(true);
    if (accRes.ok) {
      expect(accRes.value).toEqual({ checked: 1, reminded: 0, escalated: 0, expired: 0 });
    }

    const recRes = await processReceptionConformingTimersService(new Date("2026-11-20T12:00:00Z"));
    expect(recRes.ok).toBe(true);
    if (recRes.ok) {
      expect(recRes.value).toEqual({ checked: 1, conformed: 0 });
    }
  });

  it("preserves accrued open minutes across schedule edits in reception conforming sweep", async () => {
    // House schedule now opens only at 09:00Z (11:00 Bukavu), but 45 open minutes already accrued
    // before schedule edit checkpoint at 07:00Z -> only 15 open minutes remain starting 09:00Z -> 09:15Z.
    mocks.hours = [
      { id: "hh-new", houseId: "house-1", weekday: 1, opensAt: "11:00", closesAt: "18:00" },
    ];
    mocks.pendingReception = [
      {
        id: "ord-rec-ckpt",
        code: "ORD-CKPT",
        houseId: "house-1",
        status: "received",
        receivedAt: new Date("2026-10-12T06:00:00Z"),
        receptionDeadlineAt: new Date("2026-10-12T09:15:00Z"),
        receptionConfirmedAt: null,
        receptionCheckpointAt: new Date("2026-10-12T07:00:00Z"),
        receptionAccruedOpenMinutes: 45,
      },
    ];

    const waitRes = await processReceptionConformingTimersService(new Date("2026-10-12T09:10:00Z"));
    expect(waitRes.ok).toBe(true);
    if (waitRes.ok) {
      expect(waitRes.value.conformed).toBe(0);
    }

    const dueRes = await processReceptionConformingTimersService(new Date("2026-10-12T09:15:00Z"));
    expect(dueRes.ok).toBe(true);
    if (dueRes.ok) {
      expect(dueRes.value.conformed).toBe(1);
    }
  });

  it("retires stale reminder/escalation outbox intents without sending, while still retrying order_expired", async () => {
    mocks.pendingIntents = [
      {
        id: "outbox-stale-rem",
        userId: null,
        phone: "timer-outbox",
        orderId: "ord-stale",
        channel: "in_app",
        templateKey: "timer_outbox:order_acceptance_reminder",
        locale: "fr",
        title: "ord-stale:order_acceptance_reminder:house-1:2026-10-12T06:00:00.000Z",
        body: JSON.stringify({
          milestone: "order_acceptance_reminder",
          orderId: "ord-stale",
          orderCode: "ORD-STALE",
          houseId: "house-1",
          houseName: "Pressing Kivu",
          houseSlug: "pressing-kivu",
          customerId: "cust-1",
          customerName: "Amani",
          customerEmail: "amani@safihub.cd",
          customerIsGuest: false,
          contactPhone: "+243990001122",
          trackingToken: "trk-s",
          assignmentRevision: "house-1:2026-10-12T06:00:00.000Z",
          completedDeliveryKeys: [],
        }),
        status: "failed",
        attemptCount: 1,
        error: "temp error",
        sentAt: null,
        readAt: null,
        createdAt: new Date(),
      },
      {
        id: "outbox-exp",
        userId: null,
        phone: "timer-outbox",
        orderId: "ord-expired-done",
        channel: "in_app",
        templateKey: "timer_outbox:order_expired",
        locale: "fr",
        title: "ord-expired-done:order_expired:house-1:2026-10-12T06:00:00.000Z",
        body: JSON.stringify({
          milestone: "order_expired",
          orderId: "ord-expired-done",
          orderCode: "ORD-EXP",
          houseId: "house-1",
          houseName: "Pressing Kivu",
          houseSlug: "pressing-kivu",
          customerId: "cust-1",
          customerName: "Amani",
          customerEmail: "amani@safihub.cd",
          customerIsGuest: false,
          contactPhone: "+243990001122",
          trackingToken: "trk-e",
          assignmentRevision: "house-1:2026-10-12T06:00:00.000Z",
          completedDeliveryKeys: [],
        }),
        status: "failed",
        attemptCount: 1,
        error: "temp error",
        sentAt: null,
        readAt: null,
        createdAt: new Date(),
      },
    ];

    // Stale order is now accepted (no longer created)
    mocks.orderSnapshot = {
      id: "ord-stale",
      status: "accepted",
      houseId: "house-1",
      createdAt: new Date("2026-10-12T06:00:00Z"),
      assignedAt: new Date("2026-10-12T06:00:00Z"),
    };

    const res = await processAcceptanceTimersService(new Date("2026-10-12T06:35:00Z"));
    expect(res.ok).toBe(true);

    // Stale reminder retired without sending to house staff
    expect(mocks.updateTimerNotificationIntent).toHaveBeenCalledWith(
      "outbox-stale-rem",
      expect.objectContaining({
        status: "sent",
        error: expect.stringContaining("Retired"),
      })
    );
    // Expiry notice still retried and delivered to customer
    expect(mocks.sendNotification).toHaveBeenCalledTimes(1);
    expect(mocks.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-1",
        orderId: "ord-expired-done",
        templateKey: "order_expired",
      })
    );
    expect(mocks.queueEmailNotification).toHaveBeenCalledTimes(1);
    expect(mocks.queueEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "order_expired", orderId: "ord-expired-done" })
    );
  });
});
