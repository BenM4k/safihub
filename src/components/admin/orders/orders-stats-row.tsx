"use client";

import { Fragment } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import type { AdminOrderTab } from "@/lib/admin-orders-query";

interface OrdersStatsRowProps {
  stats: {
    today: number;
    awaiting: number;
    inProgress: number;
    delivered: number;
    cancelled: number;
  };
  activeTab: AdminOrderTab;
  onSelectTab: (tab: AdminOrderTab) => void;
}

export function OrdersStatsRow({
  stats,
  activeTab,
  onSelectTab,
}: OrdersStatsRowProps) {
  const t = useTranslations("admin.orders");

  const cards: Array<{
    id: AdminOrderTab;
    label: string;
    count: number;
    icon: typeof Clock;
    colorClass: string;
    badgeClass: string;
  }> = [
    {
      id: "today",
      label: t("statsToday"),
      count: stats.today,
      icon: Clock,
      colorClass: "text-foreground",
      badgeClass: "bg-muted text-foreground",
    },
    {
      id: "awaiting",
      label: t("statsAwaiting"),
      count: stats.awaiting,
      icon: AlertCircle,
      colorClass: "text-warning",
      badgeClass: "bg-warning-soft text-warning",
    },
    {
      id: "in_progress",
      label: t("statsInProgress"),
      count: stats.inProgress,
      icon: Package,
      colorClass: "text-primary",
      badgeClass: "bg-primary/10 text-primary",
    },
    {
      id: "delivered",
      label: t("statsDelivered"),
      count: stats.delivered,
      icon: CheckCircle2,
      colorClass: "text-success",
      badgeClass: "bg-success-soft text-success",
    },
    {
      id: "cancelled",
      label: t("statsCancelled"),
      count: stats.cancelled,
      icon: XCircle,
      colorClass: "text-destructive",
      badgeClass: "bg-destructive-soft text-destructive",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1 animate-stagger">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const isSelected = activeTab === c.id;
        return (
          <Fragment key={c.id}>
            {idx > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="hidden sm:block h-10 mx-3 shrink-0"
                />
                <Separator
                  orientation="horizontal"
                  className="sm:hidden my-2"
                />
              </>
            )}
            <button
              type="button"
              onClick={() => onSelectTab(isSelected ? "all" : c.id)}
              className={`flex-1 min-h-11 text-left p-2.5 rounded-md transition-all press cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              }`}
              aria-pressed={isSelected}
              aria-label={`${c.label}: ${c.count}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider truncate ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {c.label}
                </span>
                <Icon
                  className={`size-3.5 shrink-0 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    isSelected ? "text-primary" : c.colorClass
                  }`}
                >
                  {c.count}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-primary/20 text-primary" : c.badgeClass
                  }`}
                >
                  {c.id === "today" ? "24h" : c.label.split(" ")[0]}
                </span>
              </div>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
