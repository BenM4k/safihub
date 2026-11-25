"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, ShieldAlert, AlertCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusBadgeTone } from "./status-badge";

export type StatusPillType =
  | "pending"
  | "reconciled"
  | "shortage"
  | "surplus"
  | "zero_discrepancy"
  | "cancelled"
  | "to_settle"
  | "settled"
  | "overdue"
  | "active"
  | "blocked";

interface StatusPillProps {
  status: StatusPillType;
  customLabel?: string;
  className?: string;
  title?: string;
}

const STATUS_META: Record<
  StatusPillType,
  {
    tone: StatusBadgeTone;
    icon: typeof Clock;
    className?: string;
  }
> = {
  pending: { tone: "secondary", icon: Clock },
  reconciled: { tone: "success", icon: CheckCircle2 },
  zero_discrepancy: { tone: "success", icon: CheckCircle2 },
  shortage: { tone: "destructive", icon: ShieldAlert, className: "font-bold" },
  surplus: { tone: "warning", icon: AlertCircle, className: "font-bold" },
  cancelled: {
    tone: "secondary",
    icon: Ban,
    className: "line-through text-muted-foreground",
  },
  to_settle: { tone: "warning", icon: Clock, className: "font-semibold" },
  settled: { tone: "success", icon: CheckCircle2, className: "font-semibold" },
  overdue: { tone: "destructive", icon: ShieldAlert, className: "font-bold" },
  active: { tone: "success", icon: CheckCircle2, className: "font-semibold" },
  blocked: { tone: "destructive", icon: Ban, className: "font-bold" },
};

export function StatusPill({
  status,
  customLabel,
  className = "",
  title,
}: StatusPillProps) {
  const t = useTranslations("admin.shared.status");
  const cfg = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = cfg.icon;

  return (
    <StatusBadge
      tone={cfg.tone}
      title={title}
      icon={<Icon className="size-3.5" aria-hidden="true" />}
      className={cn(cfg.className, className)}
    >
      {customLabel || t(status in STATUS_META ? status : "pending")}
    </StatusBadge>
  );
}
