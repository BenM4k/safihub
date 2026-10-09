"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getUserNotificationsAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications.actions";
import type { NotificationRecord } from "@/dal";

interface NotificationsInboxWidgetProps {
  initialUnreadCount?: number;
  className?: string;
  buttonClassName?: string;
}

export function NotificationsInboxWidget({
  initialUnreadCount = 0,
  className = "",
  buttonClassName = "",
}: NotificationsInboxWidgetProps) {
  const t = useTranslations("notifications");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Load latest on popover open
  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setIsLoading(true);
      const res = await getUserNotificationsAction(5, 0);
      if (res.ok && res.value) {
        setItems(res.value.items);
        setUnreadCount(res.value.unreadCount);
      }
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (res.ok) {
        setUnreadCount(0);
        setItems((prev) =>
          prev.map((item) => ({ ...item, readAt: new Date() }))
        );
      }
    });
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={t("title")}
        aria-expanded={isOpen}
        className={`relative p-2 rounded-full transition focus:outline-hidden focus:ring-2 focus:ring-primary/20 ${
          buttonClassName || "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        }`}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">
                {t("title")}
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                  {unreadCount} {t("unread")}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCheck className="size-3" />
                )}
                {t("markAllAsRead")}
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
            {isLoading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {t("emptyTitle")}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`py-2 px-1 text-left transition ${
                    !item.readAt ? "bg-slate-50/70 font-medium" : "opacity-80"
                  }`}
                >
                  <p className="text-xs text-slate-900 font-semibold line-clamp-1">
                    {item.title || t("title")}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                    {item.body}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("viewAll")} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
