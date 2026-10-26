"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, PauseCircle, Clock, Ban } from "lucide-react";
import type { HouseOperationalStatus } from "./types";

interface HouseStatusPillProps {
  status: HouseOperationalStatus;
  className?: string;
}

const statusConfig: Record<
  HouseOperationalStatus,
  {
    key: "statusActive" | "statusPaused" | "statusClosedToday" | "statusSuspended";
    icon: typeof CheckCircle2;
    classes: string;
  }
> = {
  active: {
    key: "statusActive",
    icon: CheckCircle2,
    classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  paused: {
    key: "statusPaused",
    icon: PauseCircle,
    classes: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  closed_today: {
    key: "statusClosedToday",
    icon: Clock,
    classes: "bg-muted text-muted-foreground",
  },
  suspended: {
    key: "statusSuspended",
    icon: Ban,
    classes: "bg-destructive/10 text-destructive font-bold",
  },
};

export function HouseStatusPill({ status, className = "" }: HouseStatusPillProps) {
  const t = useTranslations("admin.houses");
  const config = statusConfig[status] ?? statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${config.classes} ${className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{t(config.key)}</span>
    </span>
  );
}
