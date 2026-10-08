import { err, ok, type Result } from "@/lib/result";
import { calculateCommission, calculateTotalDue } from "@/services/pricing";
import type { ApprovalMethod, OrderItemStatus, OrderStatus } from "@/services/db/schema";
import { transitionOrder } from "./transitions";

export interface PickupItemVerificationInput {
  orderItemId: string;
  declaredQuantity: number;
  pickupQuantity: number;
  conditionNote?: string | null;
  isFlagged?: boolean; // valuable or damaged
}

export interface PickupVerificationResult {
  hasCountDiscrepancy: boolean;
  totalDeclared: number;
  totalCounted: number;
  items: Array<{
    orderItemId: string;
    declaredQuantity: number;
    pickupQuantity: number;
    conditionNote?: string | null;
    isFlagged: boolean;
  }>;
}

export interface HouseExclusionRule {
  itemId?: string | null;
  fabricId?: string | null;
}

export interface ReceptionItemVerificationInput {
  orderItemId: string;
  itemId: string;
  fabricId?: string;
  unitPrice: number;
  declaredQuantity: number;
  receivedQuantity: number;
  isExplicitlyRejectedByHouse?: boolean;
}

export interface ReceptionVerificationResult {
  hasPriceAdjustment: boolean;
  previousItemsTotal: number;
  adjustedItemsTotal: number;
  commissionAmount: number;
  totalDue: number;
  returnedItems: Array<{
    orderItemId: string;
    itemId: string;
    quantity: number;
    reason: string;
  }>;
  acceptedItems: Array<{
    orderItemId: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    status: OrderItemStatus;
  }>;
  suggestedStatus: OrderStatus;
}

/**
 * Validates courier pickup count on-site with customer.
 * AC 9: Items flagged valuable or damaged require at least 1 photo.
 */
export function recordPickupCount(
  items: PickupItemVerificationInput[],
  photosCountByItem: Record<string, number>
): Result<PickupVerificationResult, string> {
  let hasDiscrepancy = false;
  let totalDeclared = 0;
  let totalCounted = 0;

  for (const item of items) {
    if (item.pickupQuantity < 0) {
      return err(`Invalid pickup quantity (${item.pickupQuantity}) for item ${item.orderItemId}`);
    }

    // AC 9: Photo required if flagged
    if (item.isFlagged) {
      const photosCount = photosCountByItem[item.orderItemId] ?? 0;
      if (photosCount < 1) {
        return err(
          `Item ${item.orderItemId} is flagged as valuable or damaged and requires at least one condition photo before pickup can be completed`
        );
      }
    }

    if (item.pickupQuantity !== item.declaredQuantity) {
      hasDiscrepancy = true;
    }

    totalDeclared += item.declaredQuantity;
    totalCounted += item.pickupQuantity;
  }

  return ok({
    hasCountDiscrepancy: hasDiscrepancy,
    totalDeclared,
    totalCounted,
    items: items.map((i) => ({
      orderItemId: i.orderItemId,
      declaredQuantity: i.declaredQuantity,
      pickupQuantity: i.pickupQuantity,
      conditionNote: i.conditionNote,
      isFlagged: i.isFlagged ?? false,
    })),
  });
}

/**
 * Validates house reception count against declared items.
 * AC 8: Gaps trigger price adjustment requiring customer approval before washing.
 * AC 10: Non-accepted/excluded items are marked returned, deducted from total (0 price), and returned.
 */
export function recordReceptionCount(params: {
  items: ReceptionItemVerificationInput[];
  houseExclusions: HouseExclusionRule[];
  commissionBps: number;
  deliveryFee: number;
}): ReceptionVerificationResult {
  const { items, houseExclusions, commissionBps, deliveryFee } = params;

  let previousItemsTotal = 0;
  let adjustedItemsTotal = 0;
  let hasAdjustment = false;

  const returnedItems: ReceptionVerificationResult["returnedItems"] = [];
  const acceptedItems: ReceptionVerificationResult["acceptedItems"] = [];

  for (const item of items) {
    const originalLineTotal = item.unitPrice * item.declaredQuantity;
    previousItemsTotal += originalLineTotal;

    // Check if house excludes this item/fabric
    const isExcluded = houseExclusions.some((ex) => {
      const itemMatches = ex.itemId ? ex.itemId === item.itemId : true;
      const fabricMatches = ex.fabricId && item.fabricId ? ex.fabricId === item.fabricId : true;
      return itemMatches && fabricMatches;
    });

    if (isExcluded || item.isExplicitlyRejectedByHouse) {
      // AC 10: Non-accepted item marked returned and removed from cleaning total
      returnedItems.push({
        orderItemId: item.orderItemId,
        itemId: item.itemId,
        quantity: item.receivedQuantity,
        reason: isExcluded ? "House exclusion policy" : "Rejected by laundry house",
      });
      hasAdjustment = true;
    } else {
      // Accepted item
      const lineTotal = item.unitPrice * item.receivedQuantity;
      adjustedItemsTotal += lineTotal;

      if (item.receivedQuantity !== item.declaredQuantity) {
        hasAdjustment = true;
      }

      acceptedItems.push({
        orderItemId: item.orderItemId,
        itemId: item.itemId,
        quantity: item.receivedQuantity,
        unitPrice: item.unitPrice,
        lineTotal,
        status: "accepted",
      });
    }
  }

  const commissionAmount = calculateCommission(adjustedItemsTotal, commissionBps);
  const totalDue = calculateTotalDue(adjustedItemsTotal, deliveryFee);

  return {
    hasPriceAdjustment: hasAdjustment,
    previousItemsTotal,
    adjustedItemsTotal,
    commissionAmount,
    totalDue,
    returnedItems,
    acceptedItems,
    suggestedStatus: hasAdjustment ? "price_adjusted" : "washing",
  };
}

/**
 * Customer (or admin on behalf) approves the price adjustment.
 * AC 8: Allows washing to begin.
 */
export function approvePriceAdjustment(params: {
  orderId: string;
  approvalMethod: ApprovalMethod;
  actorId: string;
  actorRole: "customer" | "courier" | "admin";
  note?: string;
}) {
  return transitionOrder(params.orderId, "price_adjusted", {
    targetStatus: "washing",
    actorId: params.actorId,
    actorRole: params.actorRole,
    approvalMethod: params.approvalMethod,
    note: params.note,
  });
}

/**
 * Customer declines price adjustment. Laundry is marked for return.
 */
export function declinePriceAdjustment(params: {
  orderId: string;
  actorId: string;
  actorRole: "customer" | "admin";
  reason?: string;
}) {
  return transitionOrder(params.orderId, "price_adjusted", {
    targetStatus: "price_declined",
    actorId: params.actorId,
    actorRole: params.actorRole,
    reason: params.reason ?? "Customer declined updated price adjustment",
  });
}
