import { err, ok, type Result } from "@/lib/result";
import {
  evaluateSlotValidity,
  findNextAvailableSlot,
  type CourierShiftSegment,
  type HouseClosure,
  type HouseHourSegment,
  type TimeSlot,
} from "@/services/availability";
import {
  checkHouseCoverage,
  type HouseCoverageRecord,
  type HouseData,
  type NeighborhoodData,
} from "@/services/coverage";
import {
  calculateCommission,
  calculateItemsTotal,
  calculateTotalDue,
  convertCdfToUsd,
  type ZonePairFee,
} from "@/services/pricing";

export interface CartLineItemInput {
  houseItemId?: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  quantity: number;
  expectedUnitPrice?: number; // Price on client when placed in cart
}

export interface CheckoutInput {
  idempotencyKey: string;
  customerId: string;
  houseId: string;
  customerNeighborhoodId: string;
  landmark: string;
  contactPhone: string;
  pickupSlot: TimeSlot;
  items: CartLineItemInput[];
  paymentCurrency?: "CDF" | "USD";
  source?: "app" | "whatsapp" | "phone";
}

export interface MasterCatalogItem {
  id: string;
  isActive: boolean;
}

export interface HouseItemRecord {
  id: string;
  houseId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  price: number; // in CDF
  isActive: boolean;
}

export interface PlatformSettingsConfig {
  maxItemsPerOrder: number;
  defaultCommissionBps: number;
  maxCoverageDistanceLevel: number;
  acceptanceDelayMinutes: number;
  leadTimeMinutes?: number;
  firstOrderScreening?: boolean;
  maxOpenOrdersPerCustomer?: number;
  dailyOrderCapPerPhone?: number;
  failedPickupBlockThreshold?: number;
}

export interface ExistingOrderSnapshot {
  id: string;
  code: string;
  trackingToken?: string;
  idempotencyKey: string;
  customerId: string;
}

export interface OrderValidationContext {
  existingOrders: ExistingOrderSnapshot[];
  houses: Map<string, HouseData & { minimumOrderAmount: number; commissionBps: number | null; cutoffMinutes: number; dailyCapacity?: number | null }>;
  neighborhoods: Map<string, NeighborhoodData>;
  houseCoverage: HouseCoverageRecord[];
  zoneFees: ZonePairFee[];
  masterServices: Map<string, MasterCatalogItem>;
  masterItems: Map<string, MasterCatalogItem>;
  masterFabrics: Map<string, MasterCatalogItem>;
  houseItems: HouseItemRecord[];
  houseHours: HouseHourSegment[];
  houseClosures: HouseClosure[];
  courierShifts: CourierShiftSegment[];
  bookedOrdersByDate?: Record<string, number>;
  currentTime?: Date;
  settings: PlatformSettingsConfig;
  activeExchangeRate?: { rate: number; isCdfPerUsd?: boolean };
  customerOpenOrdersCount?: number;
  customerCompletedOrdersCount?: number;
  dailyOrdersForPhoneCount?: number;
  isCustomerBlocked?: boolean;
}

export interface ValidatedLineItem {
  houseItemId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ValidatedOrderPayload {
  isDuplicate: boolean;
  existingOrderId?: string;
  customerId: string;
  houseId: string;
  neighborhoodId: string;
  landmark: string;
  contactPhone: string;
  idempotencyKey: string;
  pickupSlotStart: Date;
  pickupSlotEnd: Date;
  items: ValidatedLineItem[];
  itemsTotal: number;
  deliveryFee: number;
  commissionBps: number;
  commissionAmount: number;
  totalDue: number;
  currency: "CDF";
  paymentCurrency: "CDF" | "USD";
  exchangeRateUsed?: string;
  usdEquivalent?: { amountCents: number; formatted: string };
  source: "app" | "whatsapp" | "phone";
}

export interface ValidationFailure {
  code:
    | "DUPLICATE_ORDER"
    | "HOUSE_NOT_FOUND"
    | "HOUSE_INACTIVE"
    | "COVERAGE_REJECTED"
    | "SLOT_INVALID"
    | "CAPACITY_REACHED"
    | "CATALOG_ITEM_INVALID"
    | "ITEM_NOT_OFFERED_BY_HOUSE"
    | "PRICE_CHANGED"
    | "MINIMUM_ORDER_NOT_MET"
    | "QUANTITY_LIMIT_EXCEEDED"
    | "EMPTY_CART"
    | "ACCOUNT_BLOCKED"
    | "OPEN_ORDER_CAP_EXCEEDED"
    | "DAILY_PHONE_CAP_EXCEEDED";
  message: string;
  details?: Record<string, unknown>;
  nextAvailableSlot?: TimeSlot | null;
}

/**
 * Single canonical order validation function powering the app, admin manual entry, and future bots.
 * Recalculates all prices, fees, availability, and enforce business invariants.
 */
export function validateOrderCheckout(
  input: CheckoutInput,
  context: OrderValidationContext
): Result<ValidatedOrderPayload, ValidationFailure> {
  // 1. Check idempotency (AC 3)
  const existing = context.existingOrders.find(
    (o) => o.customerId === input.customerId && o.idempotencyKey === input.idempotencyKey
  );
  if (existing) {
    return ok({
      isDuplicate: true,
      existingOrderId: existing.id,
      customerId: input.customerId,
      houseId: input.houseId,
      neighborhoodId: input.customerNeighborhoodId,
      landmark: input.landmark,
      contactPhone: input.contactPhone,
      idempotencyKey: input.idempotencyKey,
      pickupSlotStart: input.pickupSlot.start,
      pickupSlotEnd: input.pickupSlot.end,
      items: [],
      itemsTotal: 0,
      deliveryFee: 0,
      commissionBps: 0,
      commissionAmount: 0,
      totalDue: 0,
      currency: "CDF",
      paymentCurrency: input.paymentCurrency ?? "CDF",
      source: input.source ?? "app",
    });
  }

  // 1b. Check if account or phone is blocked (Task 10.1)
  if (context.isCustomerBlocked) {
    return err({
      code: "ACCOUNT_BLOCKED",
      message: "Votre compte ou numéro de téléphone est bloqué. Veuillez contacter le support.",
    });
  }

  // 1c. Check open orders cap (Task 10.1: open-order cap, default 2)
  const maxOpenOrders = context.settings.maxOpenOrdersPerCustomer ?? 2;
  if (
    context.customerOpenOrdersCount !== undefined &&
    context.customerOpenOrdersCount >= maxOpenOrders
  ) {
    return err({
      code: "OPEN_ORDER_CAP_EXCEEDED",
      message: `Limite maximale de commandes en cours (${maxOpenOrders}) atteinte. Veuillez attendre la livraison de vos commandes actuelles.`,
      details: {
        maxOpenOrders,
        currentOpenOrders: context.customerOpenOrdersCount,
      },
    });
  }

  // 1d. Check daily cap per phone (Task 10.1: daily cap per phone, default 3)
  const dailyCap = context.settings.dailyOrderCapPerPhone ?? 3;
  if (
    context.dailyOrdersForPhoneCount !== undefined &&
    context.dailyOrdersForPhoneCount >= dailyCap
  ) {
    return err({
      code: "DAILY_PHONE_CAP_EXCEEDED",
      message: `Limite quotidienne de commandes atteinte pour ce numéro de téléphone (${input.contactPhone}).`,
      details: {
        dailyCap,
        currentDailyOrders: context.dailyOrdersForPhoneCount,
      },
    });
  }

  // 2. Validate cart items presence and quantity limits (Check 6)
  if (!input.items || input.items.length === 0) {
    return err({ code: "EMPTY_CART", message: "Cart cannot be empty" });
  }

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return err({
        code: "QUANTITY_LIMIT_EXCEEDED",
        message: "Line item quantity must be a positive integer",
      });
    }
  }

  const totalQuantity = input.items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity <= 0) {
    return err({ code: "QUANTITY_LIMIT_EXCEEDED", message: "Total quantity must be greater than 0" });
  }
  if (totalQuantity > context.settings.maxItemsPerOrder) {
    return err({
      code: "QUANTITY_LIMIT_EXCEEDED",
      message: `Total quantity (${totalQuantity}) exceeds maximum allowed items per order (${context.settings.maxItemsPerOrder})`,
    });
  }

  // 3. Validate House and Customer Neighborhood existence
  const house = context.houses.get(input.houseId);
  if (!house) {
    return err({ code: "HOUSE_NOT_FOUND", message: "Selected laundry house does not exist" });
  }

  const customerNeighborhood = context.neighborhoods.get(input.customerNeighborhoodId);
  const houseNeighborhood = context.neighborhoods.get(house.neighborhoodId);
  if (!customerNeighborhood || !houseNeighborhood) {
    return err({ code: "COVERAGE_REJECTED", message: "Invalid customer or house neighborhood" });
  }

  // 4. Validate Coverage & Distance Limits (AC 18, AC 21)
  const coverageCheck = checkHouseCoverage({
    customerNeighborhood,
    house,
    houseNeighborhood,
    houseCoverage: context.houseCoverage,
    zoneFees: context.zoneFees,
    globalMaxDistanceLevel: context.settings.maxCoverageDistanceLevel,
  });

  if (!coverageCheck.ok) {
    return err({
      code: "COVERAGE_REJECTED",
      message: coverageCheck.error.reason,
      details: { failureCode: coverageCheck.error.code },
    });
  }

  // 5. Validate Slot Availability & Opening Hours (AC 1, AC 5)
  const currentTime = context.currentTime ?? new Date();
  const slotEval = evaluateSlotValidity({
    slot: input.pickupSlot,
    houseHours: context.houseHours.filter((h) => (h.houseId ? h.houseId === house.id : true)),
    houseClosures: context.houseClosures.filter((c) => (c.houseId ? c.houseId === house.id : true)),
    cutoffMinutes: house.cutoffMinutes,
    dailyCapacity: house.dailyCapacity,
    bookedOrdersByDate: context.bookedOrdersByDate ?? {},
    courierShifts: context.courierShifts,
    currentTime,
    leadTimeMinutes: context.settings.leadTimeMinutes,
  });

  if (!slotEval.valid) {
    // AC 1: Refuse and propose next available slot
    const nextSlot = findNextAvailableSlot({
      referenceTime: currentTime,
      houseHours: context.houseHours.filter((h) => (h.houseId ? h.houseId === house.id : true)),
      houseClosures: context.houseClosures.filter((c) => (c.houseId ? c.houseId === house.id : true)),
      cutoffMinutes: house.cutoffMinutes,
      dailyCapacity: house.dailyCapacity,
      bookedOrdersByDate: context.bookedOrdersByDate ?? {},
      courierShifts: context.courierShifts,
      leadTimeMinutes: context.settings.leadTimeMinutes,
    });

    const isCapacity = slotEval.code === "DAILY_CAPACITY_REACHED";
    return err({
      code: isCapacity ? "CAPACITY_REACHED" : "SLOT_INVALID",
      message: slotEval.reason ?? "Requested pickup slot is not available",
      nextAvailableSlot: nextSlot,
    });
  }

  // 6. Validate Catalog, House Offerings, and Price Changes (AC 2, One house per cart)
  const validatedItems: ValidatedLineItem[] = [];

  for (const line of input.items) {
    if (line.quantity <= 0) {
      return err({ code: "QUANTITY_LIMIT_EXCEEDED", message: "Line item quantity must be positive" });
    }

    const srv = context.masterServices.get(line.serviceId);
    const itm = context.masterItems.get(line.itemId);
    const fab = context.masterFabrics.get(line.fabricId);

    if (!srv?.isActive || !itm?.isActive || !fab?.isActive) {
      return err({
        code: "CATALOG_ITEM_INVALID",
        message: "Item, fabric, or service is inactive or does not exist in master catalogue",
      });
    }

    const houseItem = context.houseItems.find(
      (hi) =>
        hi.houseId === house.id &&
        hi.serviceId === line.serviceId &&
        hi.itemId === line.itemId &&
        hi.fabricId === line.fabricId &&
        hi.isActive
    );

    if (!houseItem) {
      return err({
        code: "ITEM_NOT_OFFERED_BY_HOUSE",
        message: "One or more items in the cart are not offered by this laundry house (one house per cart)",
      });
    }

    // AC 2: Check if client's price differs from the database price
    if (line.expectedUnitPrice !== undefined && line.expectedUnitPrice !== houseItem.price) {
      return err({
        code: "PRICE_CHANGED",
        message: `Price changed for an item. Old price: ${line.expectedUnitPrice} CDF, New price: ${houseItem.price} CDF. Please confirm.`,
        details: {
          itemId: line.itemId,
          serviceId: line.serviceId,
          fabricId: line.fabricId,
          oldPrice: line.expectedUnitPrice,
          newPrice: houseItem.price,
        },
      });
    }

    const lineTotal = houseItem.price * line.quantity;
    validatedItems.push({
      houseItemId: houseItem.id,
      serviceId: line.serviceId,
      itemId: line.itemId,
      fabricId: line.fabricId,
      quantity: line.quantity,
      unitPrice: houseItem.price,
      lineTotal,
    });
  }

  // 7. Calculate Totals & Minimum Order (AC 4)
  const itemsTotal = calculateItemsTotal(
    validatedItems.map((vi) => ({ unitPrice: vi.unitPrice, quantity: vi.quantity }))
  );

  if (itemsTotal < house.minimumOrderAmount) {
    const missing = house.minimumOrderAmount - itemsTotal;
    return err({
      code: "MINIMUM_ORDER_NOT_MET",
      message: `Total items amount (${itemsTotal} CDF) is below the house minimum order of ${house.minimumOrderAmount} CDF. Missing amount: ${missing} CDF.`,
      details: { itemsTotal, minimumOrderAmount: house.minimumOrderAmount, missingAmount: missing },
    });
  }

  // 8. Freeze Fees, Commission & Currency
  const deliveryFee = coverageCheck.value.deliveryFee;
  const commissionBps = house.commissionBps ?? context.settings.defaultCommissionBps;
  const commissionAmount = calculateCommission(itemsTotal, commissionBps);
  const totalDue = calculateTotalDue(itemsTotal, deliveryFee);

  let usdEquivalent: { amountCents: number; formatted: string } | undefined;
  let exchangeRateUsed: string | undefined;

  if (context.activeExchangeRate) {
    exchangeRateUsed = context.activeExchangeRate.rate.toString();
    usdEquivalent = convertCdfToUsd(totalDue, context.activeExchangeRate.rate, {
      rateIsCdfPerUsd: context.activeExchangeRate.isCdfPerUsd ?? true,
    });
  }

  return ok({
    isDuplicate: false,
    customerId: input.customerId,
    houseId: input.houseId,
    neighborhoodId: input.customerNeighborhoodId,
    landmark: input.landmark,
    contactPhone: input.contactPhone,
    idempotencyKey: input.idempotencyKey,
    pickupSlotStart: input.pickupSlot.start,
    pickupSlotEnd: input.pickupSlot.end,
    items: validatedItems,
    itemsTotal,
    deliveryFee,
    commissionBps,
    commissionAmount,
    totalDue,
    currency: "CDF",
    paymentCurrency: input.paymentCurrency ?? "CDF",
    exchangeRateUsed,
    usdEquivalent,
    source: input.source ?? "app",
  });
}
