import { CheckCircle2, Clock, ShieldAlert, AlertCircle, Ban } from "lucide-react";

export type StatusPillType =
  | "pending"
  | "reconciled"
  | "shortage"
  | "surplus"
  | "zero_discrepancy"
  | "cancelled"
  | "to_settle"
  | "settled"
  | "overdue";

interface StatusPillProps {
  status: StatusPillType;
  customLabel?: string;
  className?: string;
}

const statusConfig: Record<
  StatusPillType,
  {
    label: string;
    icon: typeof Clock;
    classes: string;
    dotClass: string;
  }
> = {
  pending: {
    label: "En attente",
    icon: Clock,
    classes: "bg-surface text-ink-700 border-border-strong",
    dotClass: "bg-ink-400",
  },
  reconciled: {
    label: "Réconcilié",
    icon: CheckCircle2,
    classes: "bg-success-light text-success-base border-success-base/30",
    dotClass: "bg-success-base",
  },
  zero_discrepancy: {
    label: "Aucun écart",
    icon: CheckCircle2,
    classes: "bg-success-light text-success-base border-success-base/30",
    dotClass: "bg-success-base",
  },
  shortage: {
    label: "Manquant",
    icon: ShieldAlert,
    classes: "bg-destructive-light text-destructive-base border-destructive-base/30 font-bold",
    dotClass: "bg-destructive-base",
  },
  surplus: {
    label: "Excédent",
    icon: AlertCircle,
    classes: "bg-warning-light text-warning-base border-warning-base/30 font-bold",
    dotClass: "bg-warning-base",
  },
  cancelled: {
    label: "Annulée",
    icon: Ban,
    classes: "bg-ink-100 text-ink-600 border-ink-300 line-through decoration-ink-400",
    dotClass: "bg-ink-500",
  },
  to_settle: {
    label: "À régler",
    icon: Clock,
    classes: "bg-warning-light text-warning-base border-warning-base/40 font-semibold",
    dotClass: "bg-warning-base",
  },
  settled: {
    label: "À jour",
    icon: CheckCircle2,
    classes: "bg-success-light text-success-base border-success-base/40 font-semibold",
    dotClass: "bg-success-base",
  },
  overdue: {
    label: "En retard",
    icon: ShieldAlert,
    classes: "bg-destructive-light text-destructive-base border-destructive-base/40 font-bold",
    dotClass: "bg-destructive-base",
  },
};

export function StatusPill({ status, customLabel, className = "" }: StatusPillProps) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-2xs transition-colors whitespace-nowrap ${cfg.classes} ${className}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{customLabel || cfg.label}</span>
    </span>
  );
}
