"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { HouseDashboardAlert } from "@/dal";

interface PartnerAlertStripProps {
  alerts: HouseDashboardAlert[];
}

export function PartnerAlertStrip({ alerts }: PartnerAlertStripProps) {
  const t = useTranslations("house.alerts");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  if (activeAlerts.length === 0) {
    return null;
  }

  function handleDismiss(id: string) {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-2.5 font-sans" aria-label={t("priorityAlertsAria")}>
      {activeAlerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const isWarning = alert.severity === "warning";

        const bgClass = isCritical
          ? "bg-destructive-soft border-destructive/20 text-destructive"
          : isWarning
          ? "bg-warning-soft border-warning/20 text-warning"
          : "bg-surface border-border text-heading";

        const iconColor = isCritical
          ? "text-destructive"
          : isWarning
          ? "text-warning"
          : "text-primary";

        const Icon = isCritical ? AlertCircle : isWarning ? AlertTriangle : Info;

        type AlertKey = Parameters<typeof t>[0];
        const title = alert.titleKey ? t(alert.titleKey as AlertKey) : alert.title;
        const message = alert.messageKey
          ? t(alert.messageKey as AlertKey, alert.messageParams ?? {})
          : alert.message;

        return (
          <div
            key={alert.id}
            role="alert"
            className={`p-3.5 sm:p-4 rounded-2xl border ${bgClass} flex items-start justify-between gap-3 shadow-xs transition-all`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <Icon className={`size-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs sm:text-sm font-bold leading-tight">
                  {title}
                </p>
                <p className="text-xs opacity-90 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-center">
              {alert.link && (
                <Link
                  href={alert.link}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-card hover:bg-surface text-heading shadow-xs border border-border transition"
                >
                  <span>{t("manage")}</span>
                  <ArrowRight className="size-3" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                aria-label={t("dismissAria")}
                className="size-7 rounded-lg text-muted-foreground hover:text-heading hover:bg-black/5 flex items-center justify-center transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
