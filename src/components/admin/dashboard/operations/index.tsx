import { getTranslations } from "next-intl/server";
import { listAdminOrders, listAdminCouriers } from "@/services/admin";
import { RecentOrdersTable, type DashboardOrderItem } from "./recent-orders-table";
import { CourierFleetList, type DashboardCourierItem } from "./courier-fleet-list";

export async function DashboardOperationsSection() {
  const t = await getTranslations("admin.dashboard");

  const [ordersRes, couriersRes] = await Promise.all([
    listAdminOrders({ limit: 5 }),
    listAdminCouriers(),
  ]);

  if (!ordersRes.ok) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-semibold">{t("operationsLoadError")}</p>
        <p className="text-xs opacity-90 mt-1">{ordersRes.error}</p>
      </div>
    );
  }

  if (!couriersRes.ok) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-semibold">{t("operationsLoadError")}</p>
        <p className="text-xs opacity-90 mt-1">{couriersRes.error}</p>
      </div>
    );
  }


  const rawOrders = ordersRes.value;
  const rawCouriers = couriersRes.value;

  // Map to dashboard orders
  const displayOrders: DashboardOrderItem[] = rawOrders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName || "Customer",
    houseName: o.houseName || "Laundry House",
    courierName: "Assigned Courier",
    status: o.status,
    totalDueCDF: o.totalDue,
    timeAgo: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  // Map to dashboard couriers using only fields present in fetched data
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
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
