import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShoppingBag, Wallet, Building2, Truck, ChevronRight } from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";
import { Separator } from "@/components/ui/separator";

interface PlatformOverviewProps {
  metrics: AdminDashboardMetrics;
}

export async function PlatformOverview({ metrics }: PlatformOverviewProps) {
  const t = await getTranslations("admin.dashboard");

  const cards = [
    {
      id: "total_orders",
      label: t("totalOrders"),
      value: metrics.totalOrders.toLocaleString("en-US"),
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      id: "cash_collected",
      label: t("cashCollected"),
      value: `CDF ${metrics.totalCashCollectedCDF.toLocaleString("en-US")}`,
      icon: Wallet,
      href: "/admin/cash",
    },
    {
      id: "active_houses",
      label: t("activeHouses"),
      value: metrics.activeHousesCount.toLocaleString("en-US"),
      icon: Building2,
      href: "/admin/houses",
    },
    {
      id: "active_couriers",
      label: t("activeCouriers"),
      value: metrics.activeCouriersCount.toLocaleString("en-US"),
      icon: Truck,
      href: "/admin/couriers",
    },
  ];

  return (
    <section aria-labelledby="kpi-heading" className="space-y-2">
      <h2 id="kpi-heading" className="text-base font-semibold leading-6 text-foreground">
        {t("platformOverviewTitle")}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center py-1">
        {cards.map((c, index) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="contents">
              {index > 0 && (
                <>
                  <Separator orientation="vertical" className="hidden sm:block h-12 mx-3 shrink-0" />
                  <Separator orientation="horizontal" className="sm:hidden my-2" />
                </>
              )}
              <Link
                href={c.href}
                className="flex-1 p-3 text-left space-y-1 transition-colors rounded-lg hover:bg-muted/30 group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {c.label}
                  </span>
                  <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="size-3.5" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-1.5">
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {c.value}
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

