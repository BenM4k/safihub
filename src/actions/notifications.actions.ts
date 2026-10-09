"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/services/auth";
import {
  getUserInbox,
  markAsRead,
  markAllAsRead,
} from "@/services/notifications";
import type { NotificationRecord } from "@/dal";

export interface NotificationsActionResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export async function getUserNotificationsAction(
  limit = 50,
  offset = 0
): Promise<NotificationsActionResult<{ items: NotificationRecord[]; unreadCount: number }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const safeLimit =
    Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : 50;
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;

  const res = await getUserInbox(user.id, safeLimit, safeOffset);
  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  return { ok: true, value: res.value };
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<NotificationsActionResult<boolean>> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const res = await markAsRead(notificationId, user.id);
  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  revalidatePath("/notifications");
  return { ok: true, value: res.value };
}

export async function markAllNotificationsReadAction(): Promise<
  NotificationsActionResult<number>
> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const res = await markAllAsRead(user.id);
  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  revalidatePath("/notifications");
  return { ok: true, value: res.value };
}
