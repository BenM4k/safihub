import { getLocale, getTranslations } from "next-intl/server";
import {
  getCachedAdminCouriers,
  getCachedRecentAdminOrders,
} from "@/app/admin/_data";
import { RecentOrdersTable, type DashboardOrderItem } from "./recent-orders-table";
import { CourierFleetList, type DashboardCourierItem } from "./courier-fleet-list";

export async function DashboardOperationsSection() {
  const [t, locale, ordersRes, couriersRes] = await Promise.all([
    getTranslations("admin.dashboard"),
    getLocale(),
    getCachedRecentAdminOrders(),
    getCachedAdminCouriers(),
  ]);

  if (!ordersRes.ok) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive animate-enter">
        <p className="font-semibold">{t("operationsLoadError")}</p>
        <p className="text-xs opacity-90 mt-1">{ordersRes.error}</p>
      </div>
    );
  }

  if (!couriersRes.ok) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive animate-enter">
        <p className="font-semibold">{t("operationsLoadError")}</p>
        <p className="text-xs opacity-90 mt-1">{couriersRes.error}</p>
      </div>
    );
  }

  const rawOrders = ordersRes.value;
  const rawCouriers = couriersRes.value;

  const displayOrders: DashboardOrderItem[] = rawOrders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName || t("customerFallback"),
    houseName: o.houseName || t("houseFallback"),
    courierName: t("assignedCourierLabel"),
    status: o.status,
    totalDueCDF: o.totalDue,
    timeAgo: new Date(o.createdAt).toLocaleTimeString(locale, {
      timeZone: "Africa/Lubumbashi",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const couriers: DashboardCourierItem[] = rawCouriers.slice(0, 4).map((c) => {
    const isAvailable = c.isActive && c.status === "active";
    return {
      id: c.userId,
      name: c.name || t("courierFallbackName", { id: c.userId.slice(0, 4) }),
      zone:
        c.coveredZoneCount > 0
          ? t("courierCoveredZones", { count: c.coveredZoneCount })
          : t("courierDefaultZone"),
      status: isAvailable ? ("available" as const) : ("offline" as const),
      missionDescription: isAvailable
        ? t("courierStatusAvailable")
        : t("courierStatusOffline"),
      cashCeilingCDF: c.cashCeiling || 150000,
    };
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter">
      <div className="lg:col-span-2">
        <RecentOrdersTable
          orders={displayOrders}
          title={t("recentOrdersTitle")}
          subtitle={t("recentOrdersSubtitle")}
        />
      </div>
      <div>
        <CourierFleetList
          couriers={couriers}
          title={t("courierFleetTitle")}
          subtitle={t("courierFleetSubtitle")}
        />
      </div>
    </section>
  );
}
