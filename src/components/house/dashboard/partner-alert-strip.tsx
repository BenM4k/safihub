"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <div className="space-y-2.5 font-sans" aria-label={t("priorityAlertsAria")}>
      {activeAlerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const isWarning = alert.severity === "warning";
        const variant = isCritical ? "destructive" : "default";

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

        return (
          <Alert
            key={alert.id}
            variant={variant}
            className={`p-3.5 sm:p-4 rounded-2xl flex items-start justify-between gap-3 shadow-xs ${
              isWarning
                ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                : ""
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <Icon className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <AlertTitle className="text-xs sm:text-sm font-bold leading-tight">
                  {title}
                </AlertTitle>
                <AlertDescription className="text-xs opacity-90 leading-relaxed">
                  {message}
                </AlertDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-center">
              {alert.link && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-card hover:bg-secondary text-heading shadow-2xs border-border"
                >
                  <Link href={alert.link}>
                    <span>{t("manage")}</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(alert.id)}
                aria-label={t("dismissAria")}
                className="size-7 rounded-lg text-muted-foreground hover:text-heading cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
