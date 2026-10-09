"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCheck, Clock, Inbox, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications.actions";
import type { NotificationRecord } from "@/dal";

interface NotificationsViewProps {
  initialItems: NotificationRecord[];
  initialUnreadCount: number;
}

export function NotificationsView({
  initialItems,
  initialUnreadCount,
}: NotificationsViewProps) {
  const t = useTranslations("notifications");
  const [items, setItems] = useState<NotificationRecord[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const filteredItems = items.filter((item) =>
    filter === "unread" ? !item.readAt : true
  );

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (res.ok && res.value) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, readAt: new Date() } : it))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => ({ ...it, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5 text-primary" />
            )}
            <span>{t("markAllAsRead")}</span>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 py-4">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t("all")} ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
            filter === "unread"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t("unread")} ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <Inbox className="size-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">
              {t("emptyTitle")}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isUnread = !item.readAt;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  isUnread
                    ? "bg-white border-primary/30 shadow-xs"
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {t(`channels.${item.channel}` as "channels.in_app" | "channels.push" | "channels.sms" | "channels.whatsapp_link")}
                      </span>
                      {isUnread && (
                        <span className="size-2 rounded-full bg-rose-500 inline-block" />
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                        <Clock className="size-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900">
                      {item.title || t("title")}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.body}
                    </p>

                    {item.orderId && (
                      <div className="mt-2.5">
                        <Link
                          href={`/orders/${item.orderId}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {t("viewOrder")} →
                        </Link>
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(item.id)}
                      disabled={isPending}
                      aria-label={t("markAsRead")}
                      title={t("markAsRead")}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition"
                    >
                      <CheckCheck className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
