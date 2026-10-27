import "server-only";

import { capturePostHogEvent } from "./posthog-client";

/**
 * Analytics events matching Product Spec Section 22 (Analytics & Monitoring).
 * Strictly enforces internal IDs only: no phone numbers, names, or addresses.
 */

export async function trackNeighborhoodSelected(params: {
  userId: string;
  neighborhoodId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "neighborhood_selected",
    distinctId: params.userId,
    properties: {
      neighborhood: params.neighborhoodId,
    },
  });
}

export async function trackCoverageUnavailable(params: {
  userId: string;
  neighborhoodId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "coverage_unavailable",
    distinctId: params.userId,
    properties: {
      neighborhood: params.neighborhoodId,
    },
  });
}

export async function trackCoverageRequested(params: {
  userId: string;
  neighborhoodId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "coverage_requested",
    distinctId: params.userId,
    properties: {
      neighborhood: params.neighborhoodId,
    },
  });
}

export async function trackHouseViewed(params: {
  userId: string;
  houseId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "house_viewed",
    distinctId: params.userId,
    properties: {
      house: params.houseId,
    },
  });
}

export async function trackCartItemAdded(params: {
  userId: string;
  houseId: string;
  itemId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "cart_item_added",
    distinctId: params.userId,
    properties: {
      house: params.houseId,
      item: params.itemId,
    },
  });
}

export async function trackCheckoutStarted(params: {
  userId: string;
  houseId: string;
  estimatedTotal: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "checkout_started",
    distinctId: params.userId,
    properties: {
      house: params.houseId,
      estimated_total: params.estimatedTotal,
    },
  });
}

export async function trackSlotUnavailable(params: {
  userId: string;
  houseId: string;
  slot: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "slot_unavailable",
    distinctId: params.userId,
    properties: {
      house: params.houseId,
      slot: params.slot,
    },
  });
}

export async function trackOrderPlaced(params: {
  userId: string;
  orderId: string;
  houseId: string;
  source: string;
  amount: number;
  currency: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "order_placed",
    distinctId: params.userId,
    properties: {
      order_id: params.orderId,
      house: params.houseId,
      source: params.source,
      amount: params.amount,
      currency: params.currency,
    },
  });
}

export async function trackOrderExpired(params: {
  houseId: string;
  orderId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "order_expired",
    distinctId: `house_${params.houseId}`,
    properties: {
      order_id: params.orderId,
      house: params.houseId,
    },
  });
}

export async function trackOrderCancelled(params: {
  orderId: string;
  userId?: string;
  stage: string;
  reason?: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "order_cancelled",
    distinctId: params.userId || `order_${params.orderId}`,
    properties: {
      order_id: params.orderId,
      stage: params.stage,
      reason: params.reason || "unspecified",
    },
  });
}

export async function trackPriceAdjusted(params: {
  orderId: string;
  houseId: string;
  difference: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "price_adjusted",
    distinctId: `order_${params.orderId}`,
    properties: {
      order_id: params.orderId,
      house: params.houseId,
      difference: params.difference,
    },
  });
}

export async function trackPriceDeclined(params: {
  orderId: string;
  houseId: string;
  difference: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "price_declined",
    distinctId: `order_${params.orderId}`,
    properties: {
      order_id: params.orderId,
      house: params.houseId,
      difference: params.difference,
    },
  });
}

export async function trackOrderDelivered(params: {
  orderId: string;
  turnaroundMinutes?: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "order_delivered",
    distinctId: `order_${params.orderId}`,
    properties: {
      order_id: params.orderId,
      ...(params.turnaroundMinutes !== undefined
        ? { turnaround_time: params.turnaroundMinutes }
        : {}),
    },
  });
}

export async function trackCustomerReordered(params: {
  userId: string;
  daysSinceLastOrder: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "customer_reordered",
    distinctId: params.userId,
    properties: {
      days_since_last_order: params.daysSinceLastOrder,
    },
  });
}

export async function trackTourStarted(params: {
  userId: string;
  tourId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "tour_started",
    distinctId: params.userId,
    properties: {
      tour_id: params.tourId,
    },
  });
}

export async function trackStepViewed(params: {
  userId: string;
  tourId: string;
  stepId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "step_viewed",
    distinctId: params.userId,
    properties: {
      tour_id: params.tourId,
      step_id: params.stepId,
    },
  });
}

export async function trackStepSkipped(params: {
  userId: string;
  tourId: string;
  stepId?: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "step_skipped",
    distinctId: params.userId,
    properties: {
      tour_id: params.tourId,
      step_id: params.stepId,
    },
  });
}

export async function trackTourCompleted(params: {
  userId: string;
  tourId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "tour_completed",
    distinctId: params.userId,
    properties: {
      tour_id: params.tourId,
    },
  });
}

export async function trackTourReplayed(params: {
  userId: string;
  tourId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "tour_replayed",
    distinctId: params.userId,
    properties: {
      tour_id: params.tourId,
    },
  });
}

export async function trackChecklistItemCompleted(params: {
  userId: string;
  houseId: string;
  itemId: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "checklist_item_completed",
    distinctId: params.userId,
    properties: {
      house_id: params.houseId,
      item_id: params.itemId,
    },
  });
}

export async function trackSubmittedForReview(params: {
  userId: string;
  houseId: string;
  completedItems: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "submitted_for_review",
    distinctId: params.userId,
    properties: {
      house_id: params.houseId,
      completed_items: params.completedItems,
    },
  });
}

export async function trackHouseReviewApproved(params: {
  adminId: string;
  houseId: string;
  timeToApprovalMinutes?: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "approved",
    distinctId: params.adminId,
    properties: {
      house_id: params.houseId,
      ...(params.timeToApprovalMinutes !== undefined
        ? { time_to_approval_minutes: params.timeToApprovalMinutes }
        : {}),
    },
  });
}

export async function trackHouseReviewNeedsChanges(params: {
  adminId: string;
  houseId: string;
  note?: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "needs_changes",
    distinctId: params.adminId,
    properties: {
      house_id: params.houseId,
      has_note: Boolean(params.note),
    },
  });
}

export async function trackHouseReviewSuspended(params: {
  adminId: string;
  houseId: string;
  note?: string;
}): Promise<void> {
  await capturePostHogEvent({
    event: "suspended",
    distinctId: params.adminId,
    properties: {
      house_id: params.houseId,
      has_note: Boolean(params.note),
    },
  });
}

export async function trackFirstOrderReceived(params: {
  houseId: string;
  orderId: string;
  timeToFirstOrderMinutes?: number;
}): Promise<void> {
  await capturePostHogEvent({
    event: "first_order_received",
    distinctId: `house_${params.houseId}`,
    properties: {
      house_id: params.houseId,
      order_id: params.orderId,
      ...(params.timeToFirstOrderMinutes !== undefined
        ? { time_to_first_order_minutes: params.timeToFirstOrderMinutes }
        : {}),
    },
  });
}

