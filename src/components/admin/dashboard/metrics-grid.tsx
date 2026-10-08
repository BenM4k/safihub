import { getTranslations } from "next-intl/server";
import {
  Package,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Bike,
  Globe2,
  CircleDollarSign,
} from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";

interface MetricsGridProps {
  metrics: AdminDashboardMetrics;
}

export async function MetricsGrid({ metrics }: MetricsGridProps) {
  const t = await getTranslations("admin.dashboard");

  const cards = [
    {
      label: t("totalOrders"),
      value: metrics.totalOrders,
      icon: Package,
      highlight: false,
      href: "/admin/orders",
    },
    {
      label: t("pendingAcceptance"),
      value: metrics.ordersPendingAcceptance,
      icon: Clock,
      highlight: metrics.ordersPendingAcceptance > 0,
      href: "/admin/dispatch",
    },
    {
      label: t("unassignedMissions"),
      value: metrics.unassignedMissionsCount,
      icon: Send,
      highlight: metrics.unassignedMissionsCount > 0,
      href: "/admin/dispatch",
    },
    {
      label: t("openDisputes"),
      value: metrics.activeDisputes,
      icon: AlertTriangle,
      highlight: metrics.activeDisputes > 0,
      href: "/admin/orders",
    },
    {
      label: t("activeHouses"),
      value: metrics.activeHousesCount,
      icon: Building2,
      highlight: false,
      href: "/admin/houses",
    },
    {
      label: t("activeCouriers"),
      value: metrics.activeCouriersCount,
      icon: Bike,
      highlight: false,
      href: "/admin/couriers",
    },
    {
      label: t("demandRequests"),
      value: metrics.pendingCoverageRequests,
      icon: Globe2,
      highlight: metrics.pendingCoverageRequests > 0,
      href: "/admin/coverage",
    },
    {
      label: t("cashCollected"),
      value: `${metrics.totalCashCollectedCDF.toLocaleString()} CDF`,
      icon: CircleDollarSign,
      highlight: false,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="p-5 bg-white rounded-xl border border-border shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
                {card.label}
              </span>
              <div
                className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                  card.highlight
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="size-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-heading tracking-tight">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
