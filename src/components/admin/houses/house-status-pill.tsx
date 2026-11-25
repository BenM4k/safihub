"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, PauseCircle, Clock, Ban } from "lucide-react";
import { StatusBadge, type StatusBadgeTone } from "@/components/admin/shared/status-badge";
import type { HouseOperationalStatus } from "./types";

interface HouseStatusPillProps {
  status: HouseOperationalStatus;
  className?: string;
}

const HOUSE_STATUS_META: Record<
  HouseOperationalStatus,
  {
    key: "statusActive" | "statusPaused" | "statusClosedToday" | "statusSuspended";
    tone: StatusBadgeTone;
    icon: typeof CheckCircle2;
  }
> = {
  active: { key: "statusActive", tone: "success", icon: CheckCircle2 },
  paused: { key: "statusPaused", tone: "warning", icon: PauseCircle },
  closed_today: { key: "statusClosedToday", tone: "secondary", icon: Clock },
  suspended: { key: "statusSuspended", tone: "destructive", icon: Ban },
};

export function HouseStatusPill({ status, className = "" }: HouseStatusPillProps) {
  const t = useTranslations("admin.houses");
  const config = HOUSE_STATUS_META[status] ?? HOUSE_STATUS_META.active;
  const Icon = config.icon;

  return (
    <StatusBadge
      tone={config.tone}
      pill
      icon={<Icon className="size-3.5" aria-hidden="true" />}
      className={status === "suspended" ? `font-bold ${className}` : className}
    >
      {t(config.key)}
    </StatusBadge>
  );
}
