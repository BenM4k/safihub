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
    classes: "bg-success-light text-success-base border-success-base/40",
  },
  paused: {
    key: "statusPaused",
    icon: PauseCircle,
    classes: "bg-warning-light text-warning-base border-warning-base/40",
  },
  closed_today: {
    key: "statusClosedToday",
    icon: Clock,
    classes: "bg-ink-100 text-ink-700 border-ink-300",
  },
  suspended: {
    key: "statusSuspended",
    icon: Ban,
    classes: "bg-destructive-light text-destructive-base border-destructive-base/40 font-bold",
  },
};

export function HouseStatusPill({ status, className = "" }: HouseStatusPillProps) {
  const t = useTranslations("admin.houses");
  const config = statusConfig[status] ?? statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-2xs whitespace-nowrap transition-colors ${config.classes} ${className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{t(config.key)}</span>
    </span>
  );
}
