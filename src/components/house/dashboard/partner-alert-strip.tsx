"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { HouseDashboardAlert } from "@/dal";

interface PartnerAlertStripProps {
  alerts: HouseDashboardAlert[];
}

/**
 * Priority alert notification strip using shadcn Alert and Button primitives.
 */
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
    <div className="space-y-3 font-sans" aria-label={t("priorityAlertsAria")}>
      {activeAlerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const isWarning = alert.severity === "warning";

        const Icon = isCritical
          ? AlertCircle
          : isWarning
          ? AlertTriangle
          : Info;

        type AlertKey = Parameters<typeof t>[0];
        const title = alert.titleKey
          ? t(alert.titleKey as AlertKey)
          : alert.title;
        const message = alert.messageKey
          ? t(alert.messageKey as AlertKey, alert.messageParams ?? {})
          : alert.message;

        const cardClasses = isCritical
          ? "bg-destructive/10 border-destructive/20 text-destructive"
          : isWarning
          ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
          : "bg-surface dark:bg-card border-border text-foreground";

        const iconClasses = isCritical
          ? "text-destructive"
          : isWarning
          ? "text-amber-600 dark:text-amber-400"
          : "text-primary";

        const descClasses = isCritical
          ? "text-destructive/90"
          : isWarning
          ? "text-amber-900/90 dark:text-amber-200/90"
          : "text-slate-600 dark:text-slate-300";

        return (
          <div
            key={alert.id}
            role="alert"
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardClasses}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <Icon className={`size-5 shrink-0 mt-0.5 ${iconClasses}`} />
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-heading leading-snug">
                  {title}
                </div>
                <div className={`text-xs sm:text-sm leading-relaxed ${descClasses}`}>
                  {message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0">
              {alert.link && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-3.5 rounded-lg text-xs font-semibold bg-card hover:bg-secondary border-border text-heading flex-1 sm:flex-initial justify-center"
                >
                  <Link href={alert.link}>
                    <span>{t("manage")}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(alert.id)}
                aria-label={t("dismissAria")}
                className="size-7 rounded-lg text-muted-foreground hover:text-heading cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
