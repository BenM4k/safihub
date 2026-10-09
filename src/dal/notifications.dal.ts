import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";

export interface NotificationRecord {
  id: string;
  userId: string | null;
  phone: string | null;
  orderId: string | null;
  channel: "in_app" | "push" | "sms" | "whatsapp_link";
  templateKey: string;
  locale: string;
  title: string | null;
  body: string;
  status: "pending" | "sent" | "failed";
  error: string | null;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface InsertNotificationInput {
  userId?: string | null;
  phone?: string | null;
  orderId?: string | null;
  channel: "in_app" | "push" | "sms" | "whatsapp_link";
  templateKey: string;
  locale?: string;
  title?: string | null;
  body: string;
  status?: "pending" | "sent" | "failed";
  error?: string | null;
  sentAt?: Date | null;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  createdAt: Date;
}

export interface UpsertPushSubscriptionInput {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}

/**
 * Creates a notification record.
 */
export async function createNotification(
  input: InsertNotificationInput
): Promise<NotificationRecord> {
  const [row] = await db
    .insert(schema.notifications)
    .values({
      userId: input.userId ?? null,
      phone: input.phone ?? null,
      orderId: input.orderId ?? null,
      channel: input.channel,
      templateKey: input.templateKey,
      locale: input.locale || "fr",
      title: input.title ?? null,
      body: input.body,
      status: input.status || "pending",
      error: input.error ?? null,
      sentAt: input.sentAt ?? null,
    })
    .returning();

  return row as unknown as NotificationRecord;
}

/**
 * Retrieves notifications for a given user, newest first, alongside unread count.
 */
export async function getNotificationsByUser(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ items: NotificationRecord[]; unreadCount: number }> {
  const items = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRes] = await db
    .select({
      unreadCount: sql<number>`count(*)::int`,
    })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    );

  return {
    items: items as unknown as NotificationRecord[],
    unreadCount: countRes?.unreadCount ?? 0,
  };
}

/**
 * Retrieves a single notification by ID.
 */
export async function getNotificationById(
  id: string
): Promise<NotificationRecord | null> {
  const [row] = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.id, id))
    .limit(1);

  return (row as unknown as NotificationRecord) ?? null;
}

/**
 * Marks a specific notification as read if owned by the user.
 */
export async function markNotificationAsRead(
  id: string,
  userId: string
): Promise<boolean> {
  const [updated] = await db
    .update(schema.notifications)
    .set({
      readAt: new Date(),
    })
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    )
    .returning({ id: schema.notifications.id });

  return Boolean(updated);
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<number> {
  const updated = await db
    .update(schema.notifications)
    .set({
      readAt: new Date(),
    })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    )
    .returning({ id: schema.notifications.id });

  return updated.length;
}

/**
 * Updates notification delivery status (sent or failed).
 */
export async function updateNotificationStatus(
  id: string,
  status: "pending" | "sent" | "failed",
  error?: string | null,
  sentAt?: Date
): Promise<void> {
  await db
    .update(schema.notifications)
    .set({
      status,
      error: error ?? null,
      sentAt: sentAt ?? (status === "sent" ? new Date() : null),
    })
    .where(eq(schema.notifications.id, id));
}

/**
 * Upserts a Web Push subscription.
 */
export async function upsertPushSubscription(
  input: UpsertPushSubscriptionInput
): Promise<PushSubscriptionRecord> {
  const [row] = await db
    .insert(schema.pushSubscriptions)
    .values({
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    })
    .onConflictDoUpdate({
      target: schema.pushSubscriptions.endpoint,
      set: {
        userId: input.userId,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent ?? null,
      },
    })
    .returning();

  return row as unknown as PushSubscriptionRecord;
}

/**
 * Gets all push subscriptions registered for a given user.
 */
export async function getPushSubscriptionsByUser(
  userId: string
): Promise<PushSubscriptionRecord[]> {
  const rows = await db
    .select()
    .from(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.userId, userId));

  return rows as unknown as PushSubscriptionRecord[];
}

/**
 * Deletes a push subscription by endpoint (e.g. on 410 Gone / expired).
 */
export async function deletePushSubscription(
  endpoint: string
): Promise<boolean> {
  const deleted = await db
    .delete(schema.pushSubscriptions)
    .where(eq(schema.pushSubscriptions.endpoint, endpoint))
    .returning({ id: schema.pushSubscriptions.id });

  return deleted.length > 0;
}
