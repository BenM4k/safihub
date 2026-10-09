import "server-only";

import {
  createNotification,
  getNotificationsByUser,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationRecord,
} from "@/dal";
import { ok, err, type Result } from "@/lib/result";
import { renderNotificationTemplate } from "./notifications.templates";
import type {
  SendNotificationInput,
} from "./notifications.types";

/**
 * Sends a notification, rendering localized copy and saving to the database.
 * Channels: in_app, push, sms, whatsapp_link.
 */
export async function sendNotification(
  input: SendNotificationInput
): Promise<Result<NotificationRecord, string>> {
  if (!input.userId && !input.phone) {
    return err("Recipient missing: either userId or phone must be specified.");
  }

  const channel = input.channel ?? "in_app";
  const locale = input.locale ?? "fr";

  let title = input.customTitle;
  let body = input.customBody;

  if (!body) {
    const rendered = renderNotificationTemplate(
      input.templateKey,
      locale,
      input.params ?? {}
    );
    title = title ?? rendered.title;
    body = rendered.body;
  }

  try {
    const record = await createNotification({
      userId: input.userId ?? null,
      phone: input.phone ?? null,
      orderId: input.orderId ?? null,
      channel,
      templateKey: input.templateKey,
      locale,
      title: title ?? null,
      body,
      status: "sent",
      sentAt: new Date(),
    });

    return ok(record);
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to record notification";
    return err(errorMsg);
  }
}

/**
 * Retrieves notifications and unread badge count for a user.
 */
export async function getUserInbox(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Result<{ items: NotificationRecord[]; unreadCount: number }, string>> {
  if (!userId) {
    return err("User ID required");
  }

  try {
    const result = await getNotificationsByUser(userId, limit, offset);
    return ok(result);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to fetch inbox notifications"
    );
  }
}

/**
 * Marks a notification as read if owned by the user.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<Result<boolean, string>> {
  if (!notificationId || !userId) {
    return err("Notification ID and User ID are required");
  }

  try {
    const success = await markNotificationAsRead(notificationId, userId);
    return ok(success);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to mark notification as read"
    );
  }
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllAsRead(
  userId: string
): Promise<Result<number, string>> {
  if (!userId) {
    return err("User ID required");
  }

  try {
    const count = await markAllNotificationsAsRead(userId);
    return ok(count);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to mark all as read"
    );
  }
}

/**
 * Retrieves a single notification.
 */
export async function getNotification(
  id: string
): Promise<Result<NotificationRecord | null, string>> {
  try {
    const item = await getNotificationById(id);
    return ok(item);
  } catch (error) {
    return err(
      error instanceof Error ? error.message : "Failed to fetch notification"
    );
  }
}
