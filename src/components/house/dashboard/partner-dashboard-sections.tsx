import {
  getHouseAlertsData,
  getHouseAcceptanceQueueData,
  getHouseKpiData,
  getHousePipelineData,
  getHouseAnalyticsData,
  getHouseTablesData,
} from "@/services/house";
import { PartnerAlertStrip } from "./partner-alert-strip";
import { AcceptanceQueue } from "./acceptance-queue";
import { PartnerKpiRow } from "./partner-kpi-row";
import { PartnerPipeline } from "./partner-pipeline";
import { PartnerAnalytics } from "./partner-analytics";
import { PartnerTables } from "./partner-tables";
import type { HouseDashboardMetrics } from "@/dal";

export async function PartnerAlertStripSection({ houseId }: { houseId: string }) {
  const res = await getHouseAlertsData(houseId);
  const alerts = res.ok ? res.value : [];
  if (alerts.length === 0) return null;
  return <PartnerAlertStrip alerts={alerts} />;
}

export async function AcceptanceQueueSection({
  houseId,
  houseSlug,
  waitingAcceptanceCount,
}: {
  houseId: string;
  houseSlug: string;
  waitingAcceptanceCount: number;
}) {
  const res = await getHouseAcceptanceQueueData(houseId);
  const { waitingAcceptanceOrders, missedOrders } = res.ok
    ? res.value
    : { waitingAcceptanceOrders: [], missedOrders: [] };

  return (
    <AcceptanceQueue
      orders={waitingAcceptanceOrders}
      missedOrders={missedOrders}
      houseSlug={houseSlug}
      waitingAcceptanceCount={waitingAcceptanceCount}
    />
  );
}

export async function PartnerKpiRowSection({
  houseId,
  houseSlug,
  waitingAcceptanceCount,
  dailyCapacity,
}: {
  houseId: string;
  houseSlug: string;
  waitingAcceptanceCount: number;
  dailyCapacity: number | null;
}) {
  const res = await getHouseKpiData(houseId);
  const data = res.ok
    ? res.value
    : {
        todayNetRevenueCDF: 0,
        yesterdayNetRevenueCDF: 0,
        weekNetRevenueCDF: 0,
        lastWeekNetRevenueCDF: 0,
        todayOrdersCount: 0,
        balanceOwedCDF: 0,
        nextSettlementDate: "",
        acceptanceRate30d: null,
      };

  const syntheticMetrics: Partial<HouseDashboardMetrics> = {
    todayNetRevenueCDF: data.todayNetRevenueCDF,
    yesterdayNetRevenueCDF: data.yesterdayNetRevenueCDF,
    weekNetRevenueCDF: data.weekNetRevenueCDF,
    lastWeekNetRevenueCDF: data.lastWeekNetRevenueCDF,
    todayOrdersCount: data.todayOrdersCount,
    dailyCapacity,
    balanceOwedCDF: data.balanceOwedCDF,
    nextSettlementDate: data.nextSettlementDate,
    waitingAcceptanceCount,
    acceptanceRate30d: data.acceptanceRate30d ?? null,
    acceptanceRateTrend: null,
  };

  return (
    <PartnerKpiRow
      metrics={syntheticMetrics as HouseDashboardMetrics}
      houseSlug={houseSlug}
    />
  );
}

export async function PartnerPipelineSection({
  houseId,
  houseSlug,
  waitingAcceptanceCount,
}: {
  houseId: string;
  houseSlug: string;
  waitingAcceptanceCount: number;
}) {
  const res = await getHousePipelineData(houseId);
  const counts = res.ok
    ? res.value
    : {
        pickupCount: 0,
        washingCount: 0,
        readyCount: 0,
        completedTodayCount: 0,
      };

  const syntheticMetrics: Partial<HouseDashboardMetrics> = {
    waitingAcceptanceCount,
    washingCount: counts.washingCount,
    readyCount: counts.readyCount,
    completedTodayCount: counts.completedTodayCount ?? 0,
  };

  return (
    <PartnerPipeline
      metrics={syntheticMetrics as HouseDashboardMetrics}
      houseSlug={houseSlug}
    />
  );
}

export async function PartnerAnalyticsSection({
  houseId,
  houseSlug,
  dailyCapacity,
  rating,
}: {
  houseId: string;
  houseSlug: string;
  dailyCapacity: number | null;
  rating?: number | null;
}) {
  const res = await getHouseAnalyticsData(houseId);
  const data = res.ok
    ? res.value
    : {
        acceptanceRate30d: null,
        todayOrdersCount: 0,
        dailyChart: [],
      };

  const syntheticMetrics: Partial<HouseDashboardMetrics> = {
    dailyCapacity,
    todayOrdersCount: data.todayOrdersCount,
    dailyChart: data.dailyChart,
    acceptanceRate30d: data.acceptanceRate30d,
    house: {
      id: houseId,
      slug: houseSlug,
      name: "",
      rating: rating ?? null,
      isPaused: false,
      dailyCapacity,
      coverImageUrl: null,
      logoUrl: null,
      statusPill: {
        status: "open",
        label: "",
        badgeClass: "",
      },
    },
  };

  return (
    <PartnerAnalytics
      metrics={syntheticMetrics as HouseDashboardMetrics}
      houseSlug={houseSlug}
    />
  );
}

export async function PartnerTablesSection({
  houseId,
  houseSlug,
}: {
  houseId: string;
  houseSlug: string;
}) {
  const res = await getHouseTablesData(houseId);
  const { recentOrders, upcomingPickups } = res.ok
    ? res.value
    : { recentOrders: [], upcomingPickups: [] };

  return (
    <PartnerTables
      recentOrders={recentOrders}
      upcomingPickups={upcomingPickups}
      houseSlug={houseSlug}
    />
  );
}
