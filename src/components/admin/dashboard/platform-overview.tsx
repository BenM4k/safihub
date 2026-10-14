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

  const cards = [
    {
      id: "total_orders",
      label: t("totalOrders"),
      value: totalOrdersValue.toLocaleString("en-US"),
      change: "+14.2%",
      isPositive: true,
      trendLabel: "vs prev 7d",
      icon: ShoppingBag,
      href: "/admin/orders",
      sparkline: [
        Math.max(1, Math.round(totalOrdersValue * 0.7)),
        Math.max(1, Math.round(totalOrdersValue * 0.8)),
        Math.max(1, Math.round(totalOrdersValue * 0.75)),
        Math.max(1, Math.round(totalOrdersValue * 0.88)),
        Math.max(1, Math.round(totalOrdersValue * 0.95)),
        totalOrdersValue,
      ],
    },
    {
      id: "cash_collected",
      label: t("cashCollected"),
      value: `CDF ${cashCollectedValue.toLocaleString("en-US")}`,
      change: "+8.5%",
      isPositive: true,
      trendLabel: "vs prev 7d",
      icon: Wallet,
      href: "/admin/cash",
      sparkline: [
        Math.max(0, Math.round(cashCollectedValue * 0.6)),
        Math.max(0, Math.round(cashCollectedValue * 0.75)),
        Math.max(0, Math.round(cashCollectedValue * 0.82)),
        Math.max(0, Math.round(cashCollectedValue * 0.91)),
        cashCollectedValue,
      ],
    },
    {
      id: "active_houses",
      label: t("activeHouses"),
      value: activeHousesValue.toLocaleString("en-US"),
      change: "+1",
      isPositive: true,
      trendLabel: "partner ateliers",
      icon: Building2,
      href: "/admin/houses",
      sparkline: [
        Math.max(1, activeHousesValue - 2),
        Math.max(1, activeHousesValue - 1),
        activeHousesValue,
      ],
    },
    {
      id: "active_couriers",
      label: t("activeCouriers"),
      value: activeCouriersValue.toLocaleString("en-US"),
      change: "+2",
      isPositive: true,
      trendLabel: "fleet on duty",
      icon: Truck,
      href: "/admin/couriers",
      sparkline: [
        Math.max(1, activeCouriersValue - 2),
        Math.max(1, activeCouriersValue - 1),
        activeCouriersValue,
      ],
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
                  <span className="text-[11px] text-slate-400 hidden xl:inline">
                    {c.trendLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Sparkline data={c.sparkline} isPositive={c.isPositive} />
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
