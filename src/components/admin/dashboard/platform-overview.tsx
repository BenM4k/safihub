import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShoppingBag, Wallet, Building2, Truck, TrendingUp, ChevronRight } from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";
import { Sparkline } from "./sparkline";

interface PlatformOverviewProps {
  metrics: AdminDashboardMetrics;
}

export async function PlatformOverview({ metrics }: PlatformOverviewProps) {
  const t = await getTranslations("admin.dashboard");

  // Sample historical trend sparklines matching current live value
  const totalOrdersValue = metrics.totalOrders;
  const cashCollectedValue = metrics.totalCashCollectedCDF;
  const activeHousesValue = metrics.activeHousesCount;
  const activeCouriersValue = metrics.activeCouriersCount;

  interface MetricCard {
    id: string;
    label: string;
    value: string;
    icon: typeof ShoppingBag;
    href: string;
    change?: string;
    isPositive?: boolean;
    trendLabel?: string;
    sparkline?: number[];
  }

  const cards: MetricCard[] = [
    {
      id: "total_orders",
      label: t("totalOrders"),
      value: totalOrdersValue.toLocaleString("en-US"),
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      id: "cash_collected",
      label: t("cashCollected"),
      value: `CDF ${cashCollectedValue.toLocaleString("en-US")}`,
      icon: Wallet,
      href: "/admin/cash",
    },
    {
      id: "active_houses",
      label: t("activeHouses"),
      value: activeHousesValue.toLocaleString("en-US"),
      icon: Building2,
      href: "/admin/houses",
    },
    {
      id: "active_couriers",
      label: t("activeCouriers"),
      value: activeCouriersValue.toLocaleString("en-US"),
      icon: Truck,
      href: "/admin/couriers",
    },
  ];

  return (
    <section aria-labelledby="kpi-heading" className="space-y-3">
      <h2 id="kpi-heading" className="text-lg font-semibold leading-6 text-slate-900">
        {t("platformOverviewTitle")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.id}
              href={c.href}
              className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm hover:border-slate-400 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">{c.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shadow-2xs">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-3xl font-semibold leading-9 text-slate-900 tracking-tight">
                    {c.value}
                  </span>
                </div>
              </div>

              {c.change && c.sparkline && c.sparkline.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                        c.isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      {c.change}
                    </span>
                    {c.trendLabel && (
                      <span className="text-[11px] text-slate-400 hidden xl:inline">
                        {c.trendLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkline data={c.sparkline} isPositive={c.isPositive} />
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
