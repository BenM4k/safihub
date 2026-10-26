"use client";

import { Fragment } from "react";
import { AlertCircle, CheckCircle2, Clock, Package, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

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
      colorClass: "text-foreground",
      badgeClass: "bg-muted text-foreground",
    },
    {
      id: "awaiting",
      label: t("statsAwaiting"),
      count: stats.awaiting,
      icon: AlertCircle,
      colorClass: "text-amber-600 dark:text-amber-400",
      badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
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
      colorClass: "text-emerald-600 dark:text-emerald-400",
      badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    {
      id: "cancelled",
      label: t("statsCancelled"),
      count: stats.cancelled,
      icon: XCircle,
      colorClass: "text-destructive",
      badgeClass: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const isSelected = activeTab === c.id;
        return (
          <Fragment key={c.id}>
            {idx > 0 && (
              <>
                <Separator orientation="vertical" className="hidden sm:block h-10 mx-3 shrink-0" />
                <Separator orientation="horizontal" className="sm:hidden my-2" />
              </>
            )}
            <button
              type="button"
              onClick={() => onSelectTab(isSelected ? "all" : c.id)}
              className={`flex-1 text-left p-2.5 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
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
