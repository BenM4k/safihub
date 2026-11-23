import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  getAdminUsers,
  getHouseClosures,
  getHouseHours,
  getHouseStaff,
  getPendingAcceptanceOrders,
  getPendingReceptionOrders,
  getSettings,
  markOrderAcceptanceEscalated,
  markOrderAcceptanceReminderSent,
  transitionOrderStatusAtomic,
  type HouseClosureRecord,
  type HouseHourRecord,
  type HouseStaffMemberRecord,
} from "@/dal";
import { inngest } from "@/inngest";
import { trackOrderExpired } from "@/services/analytics";
import { getAppBaseUrl, queueEmailNotification } from "@/services/email";
import { sendNotification } from "@/services/notifications";
import {
  computeAcceptanceDeadlines,
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

/**
 * Evaluates all `created` orders against their opening-hours-aware 45-minute
 * acceptance schedule (50% reminder, 75% escalation, 100% expiry), and dispatches
 * Email, WhatsApp, and In-App notifications on state milestones.
 */
export async function processAcceptanceTimersService(
  now: Date = new Date()
): Promise<Result<AcceptanceTimersSweepResult>> {
  try {
    const pendingOrders = await getPendingAcceptanceOrders();
    if (pendingOrders.length === 0) {
      return ok({ checked: 0, reminded: 0, escalated: 0, expired: 0 });
    }

    const settings = await getSettings();
    const delayMinutes = settings.acceptanceDelayMinutes ?? 45;
    const baseUrl = getAppBaseUrl();

    const hoursCache = new Map<string, HouseHourRecord[]>();
    const closuresCache = new Map<string, HouseClosureRecord[]>();
    const staffCache = new Map<string, HouseStaffMemberRecord[]>();
    let cachedAdmins: Awaited<ReturnType<typeof getAdminUsers>> | null = null;

    const getCachedHouseStaff = async (houseId: string) => {
      let staff = staffCache.get(houseId);
      if (!staff) {
        staff = await getHouseStaff(houseId).catch(() => []);
        staffCache.set(houseId, staff);
      }
      return staff;
    };

    const getCachedAdmins = async () => {
      if (!cachedAdmins) {
        cachedAdmins = await getAdminUsers({ role: "admin", status: "active" }).catch(() => []);
      }
      return cachedAdmins;
    };

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

      const deadlines = computeAcceptanceDeadlines(
        order.createdAt,
        delayMinutes,
        hours,
        closures
      );

      const action = evaluateAcceptanceJob(
        {
          id: order.id,
          status: order.status,
          acceptanceDeadlineAt: order.acceptanceDeadlineAt,
          acceptanceReminderAt: deadlines.reminderAt,
          acceptanceReminderSentAt: order.acceptanceReminderSentAt,
          acceptanceEscalationAt: deadlines.escalationAt,
          acceptanceEscalatedAt: order.acceptanceEscalatedAt,
        },
        now
      );

      const orderIdShort = order.code;
      const houseName = order.houseName;

      if (action.type === "expire_order") {
        const transitionRes = transitionOrder(order.id, order.status, {
          targetStatus: "expired",
          actorRole: "system",
          reason: "Délai d'acceptation de 45 minutes ouvrées dépassé",
        });

        if (transitionRes.ok) {
          const updated = await transitionOrderStatusAtomic({
            orderId: order.id,
            expectedStatus: "created",
            newStatus: "expired",
            event: transitionRes.value.event,
          });
          if (updated) {
            expired++;
            trackOrderExpired({ houseId: order.houseId, orderId: order.id }).catch(
              () => {}
            );

            const trackingUrl = `${baseUrl}/track/${order.trackingToken}`;
            const notifications: Array<Promise<unknown>> = [
              sendNotification({
                userId: order.customerId,
                phone: order.contactPhone,
                orderId: order.id,
                channel: "in_app",
                templateKey: "order_expired",
                params: { orderIdShort, houseName, trackingUrl },
              }),
            ];

            if (
              order.customerEmail &&
              !order.customerIsGuest &&
              !order.customerEmail.endsWith("@guest.invalid")
            ) {
              notifications.push(
                queueEmailNotification({
                  kind: "order_expired",
                  orderId: order.id,
                  email: order.customerEmail,
                  recipientName: order.customerName,
                  orderCode: order.code,
                  houseName,
                  trackingUrl,
                })
              );
            }

            if (order.contactPhone && process.env.NODE_ENV !== "test") {
              notifications.push(
                inngest.send({
                  name: "whatsapp/notification.requested",
                  id: `wa-order-expired-${order.id}`,
                  data: {
                    kind: "order_status",
                    orderId: order.id,
                    orderCode: order.code,
                    customerUserId: order.customerId,
                    customerPhone: order.contactPhone,
                    status: "order_expired",
                    houseName,
                    trackingToken: order.trackingToken,
                  },
                })
              );
            }

            await Promise.allSettled(notifications);
          }
        }
      } else if (action.type === "alert_admin") {
        const marked = await markOrderAcceptanceEscalated(
          order.id,
          action.escalationTimestamp
        );
        if (marked) {
          escalated++;
          const admins = await getCachedAdmins();
          const adminDispatchUrl = `${baseUrl}/admin/dispatch`;
          await Promise.allSettled(
            admins.flatMap((admin) => [
              sendNotification({
                userId: admin.id,
                orderId: order.id,
                channel: "in_app",
                templateKey: "admin_escalation_alert",
                params: { orderIdShort, houseName },
              }),
              ...(admin.email
                ? [
                    queueEmailNotification({
                      kind: "order_acceptance_escalation",
                      orderId: order.id,
                      email: admin.email,
                      recipientName: admin.name,
                      orderCode: order.code,
                      houseName,
                      adminDispatchUrl,
                    }),
                  ]
                : []),
            ])
          );
        }
      } else if (action.type === "remind_house") {
        const marked = await markOrderAcceptanceReminderSent(
          order.id,
          action.reminderTimestamp
        );
        if (marked) {
          reminded++;
          const staffList = await getCachedHouseStaff(order.houseId);
          const partnerOrderUrl = `${baseUrl}/partner/${order.houseSlug}/orders/${order.id}`;
          await Promise.allSettled(
            staffList.flatMap((staff) => [
              sendNotification({
                userId: staff.userId,
                orderId: order.id,
                channel: "in_app",
                templateKey: "house_acceptance_reminder",
                params: { orderIdShort, houseName },
              }),
              ...(staff.email
                ? [
                    queueEmailNotification({
                      kind: "order_acceptance_reminder",
                      orderId: order.id,
                      email: staff.email,
                      recipientName: staff.name,
                      orderCode: order.code,
                      houseName,
                      partnerOrderUrl,
                    }),
                  ]
                : []),
            ])
          );
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

    let conformed = 0;

    for (const order of pendingOrders) {
      const action = evaluateReceptionConformingJob(
        {
          id: order.id,
          status: order.status,
          receivedAt: order.receivedAt,
          receptionDeadlineAt: order.receptionDeadlineAt,
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
