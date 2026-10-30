import { Suspense } from "react";
import { PartnerDashboardInteractive } from "./partner-dashboard-interactive";
import { PartnerBanner } from "./partner-banner";
import { PartnerContextualActions } from "./partner-contextual-actions";
import { SetupChecklistCard } from "../onboarding/setup-checklist-card";
import {
  PartnerAlertStripSection,
  AcceptanceQueueSection,
  PartnerKpiRowSection,
  PartnerPipelineSection,
  PartnerAnalyticsSection,
  PartnerTablesSection,
} from "./partner-dashboard-sections";
import {
  AcceptanceQueueSkeleton,
  PartnerKpiRowSkeleton,
  PartnerPipelineSkeleton,
  PartnerAnalyticsSkeleton,
  PartnerTablesSkeleton,
} from "./partner-dashboard-skeleton";
import type { HouseBannerProfileRecord, HouseChecklistDerivation } from "@/dal";

interface PartnerDashboardViewProps {
  house: HouseBannerProfileRecord;
  houseId: string;
  houseSlug: string;
  waitingAcceptanceCount: number;
  checklist?: HouseChecklistDerivation | null;
}

/**
 * Server Component orchestrating the partner dashboard view.
 * Utilizes the Donut Pattern:
 * - PartnerDashboardInteractive provides the client shell (offline presence, audio chimes, polling).
 * - Common shared data (house, waitingAcceptanceCount, checklist) is passed from the parent.
 * - Each distinct section component independently fetches its own data and streams behind its own Suspense boundary.
 */
export function PartnerDashboardView({
  house,
  houseId,
  houseSlug,
  waitingAcceptanceCount,
  checklist,
}: PartnerDashboardViewProps) {
  return (
    <PartnerDashboardInteractive
      initialWaitingCount={waitingAcceptanceCount}
      initialPaused={house.isPaused}
    >
      {/* 1. Identity Banner Header (uses shared house data) */}
      <PartnerBanner house={house} />

      {/* 2. Priority Alert Strip (fetches its own alerts) */}
      <Suspense fallback={null}>
        <PartnerAlertStripSection houseId={houseId} />
      </Suspense>

      {/* 2b. Setup Checklist & Validation Card (uses shared checklist) */}
      {checklist && checklist.reviewStatus !== "approved" && (
        <div data-tour-id="tour-checklist-card">
          <SetupChecklistCard checklist={checklist} houseSlug={houseSlug} />
        </div>
      )}

      {/* 3. Orders Awaiting Acceptance Priority Queue (fetches its own orders) */}
      <Suspense fallback={<AcceptanceQueueSkeleton />}>
        <AcceptanceQueueSection
          houseId={houseId}
          houseSlug={houseSlug}
          waitingAcceptanceCount={waitingAcceptanceCount}
        />
      </Suspense>

      {/* 4. Clickable KPI Row (fetches revenues & settlement) */}
      <Suspense fallback={<PartnerKpiRowSkeleton />}>
        <PartnerKpiRowSection
          houseId={houseId}
          houseSlug={houseSlug}
          waitingAcceptanceCount={waitingAcceptanceCount}
          dailyCapacity={house.dailyCapacity}
        />
      </Suspense>

      {/* 5. Pipeline Status Cards (fetches pipeline counts) */}
      <Suspense fallback={<PartnerPipelineSkeleton />}>
        <PartnerPipelineSection
          houseId={houseId}
          houseSlug={houseSlug}
          waitingAcceptanceCount={waitingAcceptanceCount}
        />
      </Suspense>

      {/* 6. Analytics, Capacity & Quality Indicators (fetches 30-day analytics & dailyChart) */}
      <Suspense fallback={<PartnerAnalyticsSkeleton />}>
        <PartnerAnalyticsSection
          houseId={houseId}
          houseSlug={houseSlug}
          dailyCapacity={house.dailyCapacity}
          rating={house.rating}
        />
      </Suspense>

      {/* 7. Tables (fetches recent orders & upcoming pickups) */}
      <Suspense fallback={<PartnerTablesSkeleton />}>
        <PartnerTablesSection houseId={houseId} houseSlug={houseSlug} />
      </Suspense>

      {/* 8. Contextual Actions (uses shared house data; renders immediately!) */}
      <PartnerContextualActions houseSlug={houseSlug} isPaused={house.isPaused} />
    </PartnerDashboardInteractive>
  );
}
