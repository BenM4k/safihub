"use client";

import { AlertCircle, CheckCircle2, Clock, Package, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrdersStatsRowProps {
  stats: {
    today: number;
    awaiting: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
  };
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function OrdersStatsRow({ stats, activeTab, onSelectTab }: OrdersStatsRowProps) {
  const t = useTranslations("admin.orders");

  const cards = [
    {
      id: "today",
      label: t("statsToday"),
      count: stats.today,
      icon: Clock,
      colorClass: "text-heading",
      badgeClass: "bg-surface text-foreground border-border",
    },
    {
      id: "awaiting",
      label: t("statsAwaiting"),
      count: stats.awaiting,
      icon: AlertCircle,
      colorClass: "text-warning-base",
      badgeClass: "bg-warning-light text-warning-base border-warning-base/20",
    },
    {
      id: "in_progress",
      label: t("statsInProgress"),
      count: stats.inProgress,
      icon: Package,
      colorClass: "text-primary",
      badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
    },
    {
      id: "delivered",
      label: t("statsDelivered"),
      count: stats.delivered,
      icon: CheckCircle2,
      colorClass: "text-success-base",
      badgeClass: "bg-success-light text-success-base border-success-base/20",
    },
    {
      id: "cancelled",
      label: t("statsCancelled"),
      count: stats.cancelled,
      icon: XCircle,
      colorClass: "text-destructive-base",
      badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeTab === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectTab(isSelected ? "all" : c.id)}
            className={`text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? "border-primary bg-card ring-2 ring-primary/25 shadow-md"
                : "border-border-strong bg-card shadow-sm hover:shadow-md hover:border-ink-400"
            }`}
            aria-label={`${c.label}: ${c.count}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                {c.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-ink-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-bold font-mono tabular-nums ${c.colorClass}`}>
                {c.count}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${c.badgeClass}`}>
                {c.id === "today" ? "24h" : c.label.split(" ")[0]}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
