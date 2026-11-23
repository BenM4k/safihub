import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  computeTimerOutboxBackoffMs,
  findPendingTimerNotificationIntentByKey,
  getAdminUsers,
  getHouseClosures,
  getHouseHours,
  getHouseStaff,
  getOrderAcceptanceSnapshot,
  getPendingAcceptanceOrders,
  getPendingReceptionOrders,
  getPendingTimerNotificationIntents,
  getSettings,
  markOrderAcceptanceEscalated,
  markOrderAcceptanceReminderSent,
  MAX_TIMER_OUTBOX_ATTEMPTS,
  transitionOrderStatusAtomic,
  updateTimerNotificationIntent,
  type HouseClosureRecord,
  type HouseHourRecord,
  type HouseStaffMemberRecord,
  type NotificationRecord,
  type OrderAcceptanceSnapshotRecord,
  type OrderTimerNotificationIntentInput,
  type PendingAcceptanceOrderRecord,
  type UserRecord,
} from "@/dal";
import { inngest } from "@/inngest";
import { trackOrderExpired } from "@/services/analytics";
import { getAppBaseUrl, queueEmailNotification } from "@/services/email";
import { sendNotification } from "@/services/notifications";
import {
  computeAcceptanceDeadlines,
  computeReceptionDeadline,
  evaluateAcceptanceJob,
  evaluateReceptionConformingJob,
} from "./deadlines";
import { transitionOrder } from "./transitions";

export interface AcceptanceTimersSweepResult {
  checked: number;
  reminded: number;
  escalated: number;
  expired: number;
}

export interface ReceptionTimersSweepResult {
  checked: number;
  conformed: number;
}

type TimerMilestone =
  | "order_acceptance_reminder"
  | "order_acceptance_escalation"
  | "order_expired";

interface TimerNotificationIntentPayload {
  milestone: TimerMilestone;
  orderId: string;
  orderCode: string;
  houseId: string;
  houseName: string;
  houseSlug: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerIsGuest: boolean;
  contactPhone: string;
  trackingToken: string;
  assignmentRevision: string;
  completedDeliveryKeys: string[];
}

interface LookupResult<T> {
  items: T[];
  failed: boolean;
}

interface TimerDeliveryTask {
  key: string;
  run: () => Promise<void>;
}

function buildTimerIntentKey(
  orderId: string,
  milestone: TimerMilestone,
  assignmentRevision: string
): string {
  return `${orderId}:${milestone}:${assignmentRevision}`;
}

function buildTimerNotificationIntent(
  order: PendingAcceptanceOrderRecord,
  milestone: TimerMilestone,
  assignmentRevision: string
): {
  payload: TimerNotificationIntentPayload;
  intentKey: string;
  dalInput: OrderTimerNotificationIntentInput;
} {
  const intentKey = buildTimerIntentKey(order.id, milestone, assignmentRevision);
  const payload: TimerNotificationIntentPayload = {
    milestone,
    orderId: order.id,
    orderCode: order.code,
    houseId: order.houseId,
    houseName: order.houseName,
    houseSlug: order.houseSlug,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerIsGuest: order.customerIsGuest,
    contactPhone: order.contactPhone,
    trackingToken: order.trackingToken,
    assignmentRevision,
    completedDeliveryKeys: [],
  };

  return {
    payload,
    intentKey,
    dalInput: {
      orderId: order.id,
      milestone,
      intentKey,
      body: JSON.stringify(payload),
    },
  };
}

async function runInAppNotification(
  input: Parameters<typeof sendNotification>[0]
): Promise<void> {
  const res = await sendNotification(input);
  if (!res.ok) {
    throw new Error(res.error || "Failed to send in-app notification");
  }
}

async function deliverTimerNotificationIntent(
  payload: TimerNotificationIntentPayload,
  deps: {
    baseUrl: string;
    getCachedHouseStaff: (houseId: string) => Promise<LookupResult<HouseStaffMemberRecord>>;
    getCachedAdmins: () => Promise<LookupResult<UserRecord>>;
  }
): Promise<{
  allSucceeded: boolean;
  completedDeliveryKeys: string[];
  errorMessage: string | null;
}> {
  const completedSet = new Set(payload.completedDeliveryKeys);
  const tasks: TimerDeliveryTask[] = [];
  let lookupFailed = false;

  const orderIdShort = payload.orderCode;
  const houseName = payload.houseName;

  if (payload.milestone === "order_expired") {
    const trackingUrl = `${deps.baseUrl}/track/${payload.trackingToken}`;
    const expireInAppKey = `in_app:expire:${payload.orderId}:${payload.assignmentRevision}:${payload.customerId}`;

    tasks.push({
      key: expireInAppKey,
      run: () =>
        runInAppNotification({
          userId: payload.customerId,
          phone: payload.contactPhone,
          orderId: payload.orderId,
          channel: "in_app",
          templateKey: "order_expired",
          dedupeKey: expireInAppKey,
          params: { orderIdShort, houseName, trackingUrl },
        }),
    });

    if (
      payload.customerEmail &&
      !payload.customerIsGuest &&
      !payload.customerEmail.endsWith("@guest.invalid")
    ) {
      const customerEmail = payload.customerEmail;
      tasks.push({
        key: `email:expire:${payload.orderId}:${payload.assignmentRevision}:${customerEmail}`,
        run: () =>
          queueEmailNotification({
            kind: "order_expired",
            orderId: payload.orderId,
            email: customerEmail,
            recipientName: payload.customerName,
            orderCode: payload.orderCode,
            houseName,
            trackingUrl,
          }),
      });
    }

    if (payload.contactPhone && process.env.NODE_ENV !== "test") {
      tasks.push({
        key: `whatsapp:expire:${payload.orderId}:${payload.assignmentRevision}:${payload.contactPhone}`,
        run: async () => {
          await inngest.send({
            name: "whatsapp/notification.requested",
            id: `wa-order-expired-${payload.orderId}`,
            data: {
              kind: "order_status",
              orderId: payload.orderId,
              orderCode: payload.orderCode,
              customerUserId: payload.customerId,
              customerPhone: payload.contactPhone,
              status: "order_expired",
              houseName,
              trackingToken: payload.trackingToken,
            },
          });
        },
      });
    }
  } else if (payload.milestone === "order_acceptance_escalation") {
    const adminLookup = await deps.getCachedAdmins();
    lookupFailed = adminLookup.failed;
    const adminDispatchUrl = `${deps.baseUrl}/admin/dispatch`;

    for (const admin of adminLookup.items) {
      const escalateInAppKey = `in_app:escalate:${payload.orderId}:${payload.assignmentRevision}:${admin.id}`;
      tasks.push({
        key: escalateInAppKey,
        run: () =>
          runInAppNotification({
            userId: admin.id,
            orderId: payload.orderId,
            channel: "in_app",
            templateKey: "admin_escalation_alert",
            dedupeKey: escalateInAppKey,
            params: { orderIdShort, houseName },
          }),
      });

      if (admin.email) {
        const adminEmail = admin.email;
        tasks.push({
          key: `email:escalate:${payload.orderId}:${payload.assignmentRevision}:${adminEmail}`,
          run: () =>
            queueEmailNotification({
              kind: "order_acceptance_escalation",
              orderId: payload.orderId,
              assignmentRevision: payload.assignmentRevision,
              email: adminEmail,
              recipientName: admin.name,
              orderCode: payload.orderCode,
              houseName,
              adminDispatchUrl,
            }),
        });
      }
    }
  } else if (payload.milestone === "order_acceptance_reminder") {
    const staffLookup = await deps.getCachedHouseStaff(payload.houseId);
    lookupFailed = staffLookup.failed;
    const partnerOrderUrl = `${deps.baseUrl}/partner/${payload.houseSlug}/orders/${payload.orderId}`;

    for (const staff of staffLookup.items) {
      const remindInAppKey = `in_app:remind:${payload.orderId}:${payload.assignmentRevision}:${staff.userId}`;
      tasks.push({
        key: remindInAppKey,
        run: () =>
          runInAppNotification({
            userId: staff.userId,
            orderId: payload.orderId,
            channel: "in_app",
            templateKey: "house_acceptance_reminder",
            dedupeKey: remindInAppKey,
            params: { orderIdShort, houseName },
          }),
      });

      if (staff.email) {
        const staffEmail = staff.email;
        tasks.push({
          key: `email:remind:${payload.orderId}:${payload.assignmentRevision}:${staffEmail}`,
          run: () =>
            queueEmailNotification({
              kind: "order_acceptance_reminder",
              orderId: payload.orderId,
              assignmentRevision: payload.assignmentRevision,
              email: staffEmail,
              recipientName: staff.name,
              orderCode: payload.orderCode,
              houseName,
              partnerOrderUrl,
            }),
        });
      }
    }
  }

  const pendingTasks = tasks.filter((task) => !completedSet.has(task.key));
  const settled = await Promise.allSettled(
    pendingTasks.map(async (task) => {
      await task.run();
      return task.key;
    })
  );

  const errors: string[] = [];
  if (lookupFailed) {
    errors.push("Recipient lookup failed");
  }

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      completedSet.add(outcome.value);
    } else {
      errors.push(
        outcome.reason instanceof Error
          ? outcome.reason.message
          : String(outcome.reason ?? "Delivery failed")
      );
    }
  }

  return {
    allSucceeded: errors.length === 0,
    completedDeliveryKeys: Array.from(completedSet),
    errorMessage: errors.length > 0 ? errors.join("; ") : null,
  };
}

async function flushTimerOutboxIntent(
  outboxRow: NotificationRecord,
  payload: TimerNotificationIntentPayload,
  deps: {
    baseUrl: string;
    getCachedHouseStaff: (houseId: string) => Promise<LookupResult<HouseStaffMemberRecord>>;
    getCachedAdmins: () => Promise<LookupResult<UserRecord>>;
    getOrderSnapshot: (orderId: string) => Promise<OrderAcceptanceSnapshotRecord | null>;
  },
  now: Date
): Promise<void> {
  if (
    payload.milestone === "order_acceptance_reminder" ||
    payload.milestone === "order_acceptance_escalation"
  ) {
    const snapshot = await deps.getOrderSnapshot(payload.orderId);
    const snapshotStart = snapshot
      ? snapshot.assignedAt
        ? new Date(snapshot.assignedAt)
        : snapshot.createdAt
      : null;
    const currentRevision =
      snapshot && snapshotStart
        ? `${snapshot.houseId}:${snapshotStart.toISOString()}`
        : null;

    if (
      !snapshot ||
      snapshot.status !== "created" ||
      currentRevision !== payload.assignmentRevision
    ) {
      await updateTimerNotificationIntent(outboxRow.id, {
        status: "sent",
        body: JSON.stringify({ ...payload, retired: true }),
        error: "Retired: stale assignment or order no longer created",
        sentAt: now,
        attemptCount: outboxRow.attemptCount ?? 0,
        nextRetryAt: null,
      }).catch(() => {});
      return;
    }
  }

  const result = await deliverTimerNotificationIntent(payload, deps);

  const updatedPayload: TimerNotificationIntentPayload = {
    ...payload,
    completedDeliveryKeys: result.completedDeliveryKeys,
  };

  if (result.allSucceeded) {
    await updateTimerNotificationIntent(outboxRow.id, {
      status: "sent",
      body: JSON.stringify(updatedPayload),
      error: null,
      sentAt: now,
      attemptCount: outboxRow.attemptCount ?? 0,
      nextRetryAt: null,
    }).catch(() => {});
    return;
  }

  const nextAttempt = (outboxRow.attemptCount ?? 0) + 1;
  const nextRetryAt =
    nextAttempt >= MAX_TIMER_OUTBOX_ATTEMPTS
      ? null
      : new Date(now.getTime() + computeTimerOutboxBackoffMs(nextAttempt));

  await updateTimerNotificationIntent(outboxRow.id, {
    status: "failed",
    body: JSON.stringify(updatedPayload),
    error: result.errorMessage,
    sentAt: null,
    attemptCount: nextAttempt,
    nextRetryAt,
  }).catch(() => {});
}

function parseOutboxPayload(row: NotificationRecord): TimerNotificationIntentPayload | null {
  try {
    const parsed = JSON.parse(row.body) as Partial<TimerNotificationIntentPayload>;
    if (!parsed.orderId || !parsed.milestone || !parsed.assignmentRevision) {
      return null;
    }
    return {
      milestone: parsed.milestone,
      orderId: parsed.orderId,
      orderCode: parsed.orderCode ?? "",
      houseId: parsed.houseId ?? "",
      houseName: parsed.houseName ?? "",
      houseSlug: parsed.houseSlug ?? "",
      customerId: parsed.customerId ?? "",
      customerName: parsed.customerName ?? "",
      customerEmail: parsed.customerEmail ?? null,
      customerIsGuest: Boolean(parsed.customerIsGuest),
      contactPhone: parsed.contactPhone ?? "",
      trackingToken: parsed.trackingToken ?? "",
      assignmentRevision: parsed.assignmentRevision,
      completedDeliveryKeys: Array.isArray(parsed.completedDeliveryKeys)
        ? parsed.completedDeliveryKeys
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Evaluates all `created` orders against their opening-hours-aware 45-minute
 * acceptance schedule (50% reminder, 75% escalation, 100% expiry), and dispatches
 * Email, WhatsApp, and In-App notifications on state milestones.
 */
export async function processAcceptanceTimersService(
  now: Date = new Date()
): Promise<Result<AcceptanceTimersSweepResult>> {
  try {
    const [pendingOrders, persistedPendingIntents] = await Promise.all([
      getPendingAcceptanceOrders(),
      getPendingTimerNotificationIntents(now).catch(() => [] as NotificationRecord[]),
    ]);

    if (pendingOrders.length === 0 && persistedPendingIntents.length === 0) {
      return ok({ checked: 0, reminded: 0, escalated: 0, expired: 0 });
    }

    const baseUrl = getAppBaseUrl();
    const hoursCache = new Map<string, HouseHourRecord[]>();
    const closuresCache = new Map<string, HouseClosureRecord[]>();
    const staffCache = new Map<string, LookupResult<HouseStaffMemberRecord>>();
    const pendingOrdersById = new Map(pendingOrders.map((o) => [o.id, o]));
    const snapshotCache = new Map<string, OrderAcceptanceSnapshotRecord | null>();
    let cachedAdmins: LookupResult<UserRecord> | null = null;

    const getOrderSnapshot = async (
      orderId: string
    ): Promise<OrderAcceptanceSnapshotRecord | null> => {
      if (snapshotCache.has(orderId)) {
        return snapshotCache.get(orderId) ?? null;
      }
      const inPending = pendingOrdersById.get(orderId);
      if (inPending) {
        const snap: OrderAcceptanceSnapshotRecord = {
          id: inPending.id,
          status: inPending.status,
          houseId: inPending.houseId,
          createdAt: inPending.createdAt,
          assignedAt: inPending.assignedAt ?? null,
        };
        snapshotCache.set(orderId, snap);
        return snap;
      }
      const fetched = await getOrderAcceptanceSnapshot(orderId).catch(() => null);
      snapshotCache.set(orderId, fetched);
      return fetched;
    };

    const getCachedHouseStaff = async (
      houseId: string
    ): Promise<LookupResult<HouseStaffMemberRecord>> => {
      let result = staffCache.get(houseId);
      if (!result) {
        try {
          const items = await getHouseStaff(houseId);
          result = { items, failed: false };
        } catch {
          result = { items: [], failed: true };
        }
        staffCache.set(houseId, result);
      }
      return result;
    };

    const getCachedAdmins = async (): Promise<LookupResult<UserRecord>> => {
      if (!cachedAdmins) {
        try {
          const admins = await getAdminUsers({ role: "admin", status: "active" });
          cachedAdmins = {
            items: admins.filter((admin) => !admin.banned),
            failed: false,
          };
        } catch {
          cachedAdmins = { items: [], failed: true };
        }
      }
      return cachedAdmins;
    };

    const deliveryDeps = {
      baseUrl,
      getCachedHouseStaff,
      getCachedAdmins,
      getOrderSnapshot,
    };

    // Retry unfinished notification intents from previous sweeps independently
    for (const row of persistedPendingIntents) {
      const parsed = parseOutboxPayload(row);
      if (!parsed) {
        const nextAttempt = (row.attemptCount ?? 0) + 1;
        const nextRetryAt =
          nextAttempt >= MAX_TIMER_OUTBOX_ATTEMPTS
            ? null
            : new Date(now.getTime() + computeTimerOutboxBackoffMs(nextAttempt));
        await updateTimerNotificationIntent(row.id, {
          status: "failed",
          body: row.body,
          error: "Malformed timer notification outbox payload",
          sentAt: null,
          attemptCount: nextAttempt,
          nextRetryAt,
        }).catch(() => {});
        continue;
      }
      await flushTimerOutboxIntent(row, parsed, deliveryDeps, now);
    }

    if (pendingOrders.length === 0) {
      return ok({ checked: 0, reminded: 0, escalated: 0, expired: 0 });
    }

    const settings = await getSettings();
    const delayMinutes = settings.acceptanceDelayMinutes ?? 45;

    let reminded = 0;
    let escalated = 0;
    let expired = 0;

    for (const order of pendingOrders) {
      let hours = hoursCache.get(order.houseId);
      if (!hours) {
        hours = await getHouseHours(order.houseId);
        hoursCache.set(order.houseId, hours);
      }

      let closures = closuresCache.get(order.houseId);
      if (!closures) {
        closures = await getHouseClosures(order.houseId);
        closuresCache.set(order.houseId, closures);
      }

      const assignmentStart = order.assignedAt
        ? new Date(order.assignedAt)
        : order.createdAt;
      const assignmentRevision = `${order.houseId}:${assignmentStart.toISOString()}`;

      const deadlines = computeAcceptanceDeadlines(
        assignmentStart,
        delayMinutes,
        hours,
        closures
      );

      const action = evaluateAcceptanceJob(
        {
          id: order.id,
          status: order.status,
          acceptanceDeadlineAt: order.acceptanceDeadlineAt
            ? deadlines.deadlineAt
            : null,
          acceptanceReminderAt: deadlines.reminderAt,
          acceptanceReminderSentAt: order.acceptanceReminderSentAt,
          acceptanceEscalationAt: deadlines.escalationAt,
          acceptanceEscalatedAt: order.acceptanceEscalatedAt,
        },
        now
      );

      if (action.type === "expire_order") {
        const transitionRes = transitionOrder(order.id, order.status, {
          targetStatus: "expired",
          actorRole: "system",
          reason: "Délai d'acceptation de 45 minutes ouvrées dépassé",
        });

        if (transitionRes.ok) {
          const intent = buildTimerNotificationIntent(
            order,
            "order_expired",
            assignmentRevision
          );
          const updated = await transitionOrderStatusAtomic({
            orderId: order.id,
            expectedStatus: "created",
            expectedHouseId: order.houseId,
            expectedAcceptanceDeadlineAt: order.acceptanceDeadlineAt,
            newStatus: "expired",
            event: transitionRes.value.event,
            notificationIntent: intent.dalInput,
          });
          if (updated) {
            expired++;
            trackOrderExpired({ houseId: order.houseId, orderId: order.id }).catch(
              () => {}
            );
            const outboxRow = await findPendingTimerNotificationIntentByKey(
              intent.intentKey
            ).catch(() => null);
            if (outboxRow) {
              await flushTimerOutboxIntent(outboxRow, intent.payload, deliveryDeps, now);
            }
          }
        }
      } else if (action.type === "alert_admin") {
        const intent = buildTimerNotificationIntent(
          order,
          "order_acceptance_escalation",
          assignmentRevision
        );
        const marked = await markOrderAcceptanceEscalated(
          order.id,
          action.escalationTimestamp,
          {
            expectedHouseId: order.houseId,
            expectedAcceptanceDeadlineAt: order.acceptanceDeadlineAt,
            notificationIntent: intent.dalInput,
          }
        );
        if (marked) {
          escalated++;
          const outboxRow = await findPendingTimerNotificationIntentByKey(
            intent.intentKey
          ).catch(() => null);
          if (outboxRow) {
            await flushTimerOutboxIntent(outboxRow, intent.payload, deliveryDeps, now);
          }
        }
      } else if (action.type === "remind_house") {
        const intent = buildTimerNotificationIntent(
          order,
          "order_acceptance_reminder",
          assignmentRevision
        );
        const marked = await markOrderAcceptanceReminderSent(
          order.id,
          action.reminderTimestamp,
          {
            expectedHouseId: order.houseId,
            expectedAcceptanceDeadlineAt: order.acceptanceDeadlineAt,
            notificationIntent: intent.dalInput,
          }
        );
        if (marked) {
          reminded++;
          const outboxRow = await findPendingTimerNotificationIntentByKey(
            intent.intentKey
          ).catch(() => null);
          if (outboxRow) {
            await flushTimerOutboxIntent(outboxRow, intent.payload, deliveryDeps, now);
          }
        }
      }
    }

    return ok({
      checked: pendingOrders.length,
      reminded,
      escalated,
      expired,
    });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to process order acceptance timers"
    );
  }
}

/**
 * Evaluates all `received` orders past their 1-hour opening-hours reception
 * window and auto-confirms them into `washing` (AC 11).
 */
export async function processReceptionConformingTimersService(
  now: Date = new Date()
): Promise<Result<ReceptionTimersSweepResult>> {
  try {
    const pendingOrders = await getPendingReceptionOrders();
    if (pendingOrders.length === 0) {
      return ok({ checked: 0, conformed: 0 });
    }

    const settings = await getSettings();
    const receptionWindowMinutes = settings.receptionWindowMinutes ?? 60;
    const hoursCache = new Map<string, HouseHourRecord[]>();
    const closuresCache = new Map<string, HouseClosureRecord[]>();

    let conformed = 0;

    for (const order of pendingOrders) {
      let hours = hoursCache.get(order.houseId);
      if (!hours) {
        hours = await getHouseHours(order.houseId);
        hoursCache.set(order.houseId, hours);
      }

      let closures = closuresCache.get(order.houseId);
      if (!closures) {
        closures = await getHouseClosures(order.houseId);
        closuresCache.set(order.houseId, closures);
      }

      const windowStart = order.receptionCheckpointAt
        ? new Date(order.receptionCheckpointAt)
        : order.receivedAt;
      const remainingMinutes = Math.max(
        0,
        receptionWindowMinutes - Math.max(0, order.receptionAccruedOpenMinutes ?? 0)
      );
      const closureAwareDeadline = !windowStart
        ? null
        : remainingMinutes === 0
          ? windowStart
          : computeReceptionDeadline(windowStart, remainingMinutes, hours, closures);

      const action = evaluateReceptionConformingJob(
        {
          id: order.id,
          status: order.status,
          receivedAt: order.receivedAt,
          receptionDeadlineAt: closureAwareDeadline,
          receptionConfirmedAt: order.receptionConfirmedAt,
          hasReportedDiscrepancy: false,
        },
        now
      );

      if (action.type !== "conform_order") {
        continue;
      }

      const transitionRes = transitionOrder(order.id, order.status, {
        targetStatus: "washing",
        actorRole: "system",
        note: "Réception confirmée automatiquement après 1 heure ouvrée (AC 11)",
      });

      if (!transitionRes.ok) {
        continue;
      }

      const updated = await transitionOrderStatusAtomic({
        orderId: order.id,
        expectedStatus: "received",
        newStatus: "washing",
        orderUpdates: {
          receptionConfirmedAt: action.confirmedAt,
        },
        event: transitionRes.value.event,
      });

      if (updated) {
        conformed++;
      }
    }

    return ok({
      checked: pendingOrders.length,
      conformed,
    });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to process reception conforming timers"
    );
  }
}
