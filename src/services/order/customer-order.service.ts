import "server-only";
import {
  createDisputeTransaction,
  getCustomerOrders,
  getOrderById,
  getOrderEvents,
  getOrderItems,
  getOrderByTrackingToken,
  insertOrderWithDetails,
  transitionOrderStatusAtomic,
  updateOrderDeliverySlot,
  type OrderDetailRecord,
  type OrderEventRecord,
  type OrderItemRecord,
  type OrderListItemRecord,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import {
  buildOrderValidationContext,
  computeAcceptanceDeadlines,
  transitionOrder,
  validateOrderCheckout,
  type CartLineItemInput,
  type CheckoutInput,
  type ValidationFailure,
} from "@/services/order";

export interface CartEstimateResult {
  items: Array<{
    houseItemId: string;
    serviceId: string;
    itemId: string;
    fabricId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  itemsTotal: number;
  deliveryFee: number;
  totalDue: number;
  minimumOrderMet: boolean;
  minimumOrderAmount: number;
  missingAmount: number;
  priceChanges: Array<{
    itemId: string;
    oldPrice: number;
    newPrice: number;
  }>;
}

export async function estimateCustomerCart(
  houseId: string,
  items: CartLineItemInput[],
  customerNeighborhoodId?: string
): Promise<Result<CartEstimateResult, string>> {
  const context = await buildOrderValidationContext({ houseId });
  const house = context.houses.get(houseId);
  if (!house) {
    return err("Maison de pressing introuvable.");
  }

  let deliveryFee = 0;
  if (customerNeighborhoodId) {
    const custNeighborhood = context.neighborhoods.get(customerNeighborhoodId);
    const houseNeighborhood = context.neighborhoods.get(house.neighborhoodId);
    if (custNeighborhood && houseNeighborhood) {
      const zf = context.zoneFees.find(
        (fee) =>
          fee.customerZoneId === custNeighborhood.zoneId &&
          fee.houseZoneId === houseNeighborhood.zoneId
      );
      if (zf) deliveryFee = zf.deliveryFee;
    }
  }

  const calculatedItems = [];
  const priceChanges = [];
  let subtotal = 0;

  for (const line of items) {
    const houseItem = context.houseItems.find(
      (hi) =>
        hi.houseId === house.id &&
        hi.serviceId === line.serviceId &&
        hi.itemId === line.itemId &&
        hi.fabricId === line.fabricId &&
        hi.isActive
    );

    if (!houseItem) {
      return err("Un ou plusieurs articles ne sont plus proposés par cet établissement.");
    }

    if (line.expectedUnitPrice !== undefined && line.expectedUnitPrice !== houseItem.price) {
      priceChanges.push({
        itemId: line.itemId,
        oldPrice: line.expectedUnitPrice,
        newPrice: houseItem.price,
      });
    }

    const lineTotal = houseItem.price * line.quantity;
    subtotal += lineTotal;

    calculatedItems.push({
      houseItemId: houseItem.id,
      serviceId: line.serviceId,
      itemId: line.itemId,
      fabricId: line.fabricId,
      quantity: line.quantity,
      unitPrice: houseItem.price,
      lineTotal,
    });
  }

  const minimumOrderMet = subtotal >= house.minimumOrderAmount;
  const missingAmount = Math.max(0, house.minimumOrderAmount - subtotal);

  return ok({
    items: calculatedItems,
    itemsTotal: subtotal,
    deliveryFee,
    totalDue: subtotal + deliveryFee,
    minimumOrderMet,
    minimumOrderAmount: house.minimumOrderAmount,
    missingAmount,
    priceChanges,
  });
}

export async function placeCustomerOrder(
  input: CheckoutInput
): Promise<Result<{ orderId: string; code: string; trackingToken: string }, ValidationFailure>> {
  const context = await buildOrderValidationContext({
    houseId: input.houseId,
    customerId: input.customerId,
    idempotencyKey: input.idempotencyKey,
  });
  const validationRes = validateOrderCheckout(input, context);

  if (!validationRes.ok) {
    return err(validationRes.error);
  }

  const payload = validationRes.value;

  // Handle Idempotent duplicate check (AC 3)
  if (payload.isDuplicate && payload.existingOrderId) {
    const existing = context.existingOrders.find((o) => o.id === payload.existingOrderId);
    return ok({
      orderId: payload.existingOrderId,
      code: existing?.code || "EXISTING",
      trackingToken: "",
    });
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const orderCode = `ORD-${dateStr}-${randomSuffix}`;
  const trackingToken = crypto.randomUUID();
  const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

  const deadlines = computeAcceptanceDeadlines(
    now,
    context.settings.acceptanceDelayMinutes,
    context.houseHours.filter((h) => h.houseId === input.houseId),
    context.houseClosures.filter((c) => c.houseId === input.houseId)
  );

  const initialStatus = "created";

  const created = await insertOrderWithDetails({
    order: {
      code: orderCode,
      trackingToken,
      idempotencyKey: input.idempotencyKey,
      customerId: input.customerId,
      houseId: input.houseId,
      neighborhoodId: input.customerNeighborhoodId,
      landmark: input.landmark,
      contactPhone: input.contactPhone,
      source: input.source ?? "app",
      status: initialStatus,
      currency: "CDF",
      paymentCurrency: input.paymentCurrency ?? "CDF",
      exchangeRateUsed: payload.exchangeRateUsed ?? null,
      itemsTotal: payload.itemsTotal,
      adjustedItemsTotal: null,
      deliveryFee: payload.deliveryFee,
      commissionBps: payload.commissionBps,
      commissionAmount: payload.commissionAmount,
      totalDue: payload.totalDue,
      deliveryConfirmationCode: deliveryCode,
      pickupSlotStart: payload.pickupSlotStart,
      pickupSlotEnd: payload.pickupSlotEnd,
      deliverySlotStart: null,
      deliverySlotEnd: null,
      acceptanceDeadlineAt: deadlines.deadlineAt,
    },
    items: payload.items.map((it) => ({
      houseItemId: it.houseItemId,
      serviceId: it.serviceId,
      itemId: it.itemId,
      fabricId: it.fabricId,
      declaredQuantity: it.quantity,
      unitPrice: it.unitPrice,
      status: "accepted",
    })),
    event: {
      type: "status_change",
      fromStatus: null,
      toStatus: initialStatus,
      actorId: input.customerId,
      actorRole: "customer",
      note: "Commande passée par le client",
    },
  });

  return ok(created);
}

export async function cancelCustomerOrder(
  orderId: string,
  customerId: string,
  reason: string = "Annulation demandée par le client avant acceptation"
): Promise<Result<void, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");
  if (order.customerId !== customerId) return err("Action non autorisée sur cette commande.");

  const transitionRes = transitionOrder(orderId, order.status, {
    targetStatus: "cancelled",
    actorId: customerId,
    actorRole: "customer",
    reason,
  });

  if (!transitionRes.ok) return err(transitionRes.error);

  await transitionOrderStatusAtomic({
    orderId,
    newStatus: "cancelled",
    event: transitionRes.value.event,
  });

  return ok(undefined);
}

export async function approveCustomerPriceAdjustment(
  orderId: string,
  actorId: string,
  method: "app" | "tracking_link" = "app"
): Promise<Result<void, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");

  const transitionRes = transitionOrder(orderId, order.status, {
    targetStatus: "washing",
    actorId,
    actorRole: "customer",
    approvalMethod: method,
    note: "Ajustement de prix validé par le client",
  });

  if (!transitionRes.ok) return err(transitionRes.error);

  await transitionOrderStatusAtomic({
    orderId,
    newStatus: "washing",
    event: transitionRes.value.event,
  });

  return ok(undefined);
}

export async function declineCustomerPriceAdjustment(
  orderId: string,
  actorId: string,
  method: "app" | "tracking_link" = "app",
  reason: string = "Ajustement de prix refusé par le client"
): Promise<Result<void, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");

  const transitionRes = transitionOrder(orderId, order.status, {
    targetStatus: "price_declined",
    actorId,
    actorRole: "customer",
    reason,
    note: `Refus via ${method}`,
  });

  if (!transitionRes.ok) return err(transitionRes.error);

  await transitionOrderStatusAtomic({
    orderId,
    newStatus: "price_declined",
    event: transitionRes.value.event,
  });

  return ok(undefined);
}

export async function confirmCustomerDeliverySlot(
  orderId: string,
  actorId: string,
  slot: { start: Date; end: Date },
  method: "app" | "tracking_link" = "app"
): Promise<Result<void, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");

  const transitionRes = transitionOrder(orderId, order.status, {
    targetStatus: "delivery_slot_confirmed",
    actorId,
    actorRole: "customer",
    note: `Créneau de livraison confirmé via ${method}`,
  });

  if (!transitionRes.ok) return err(transitionRes.error);

  await updateOrderDeliverySlot({
    orderId,
    deliverySlotStart: slot.start,
    deliverySlotEnd: slot.end,
    newStatus: "delivery_slot_confirmed",
    event: transitionRes.value.event,
  });

  return ok(undefined);
}

export async function openCustomerOrderDispute(
  orderId: string,
  customerId: string,
  data: {
    type: "loss" | "damage" | "payment" | "other";
    description: string;
  }
): Promise<Result<{ disputeId: string }, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");
  if (order.customerId !== customerId) return err("Action non autorisée.");

  const transitionRes = transitionOrder(orderId, order.status, {
    targetStatus: "disputed",
    actorId: customerId,
    actorRole: "customer",
    reason: data.description,
    payload: { disputeType: data.type },
  });

  if (!transitionRes.ok) return err(transitionRes.error);

  const res = await createDisputeTransaction({
    orderId,
    openedBy: customerId,
    type: data.type,
    description: data.description,
    event: transitionRes.value.event,
  });

  return ok(res);
}

export async function getCustomerOrdersList(
  customerId: string
): Promise<OrderListItemRecord[]> {
  return await getCustomerOrders(customerId);
}

export async function getCustomerOrderDetail(
  orderId: string,
  customerId: string
): Promise<Result<{ order: OrderDetailRecord; items: OrderItemRecord[]; events: OrderEventRecord[] }, string>> {
  const order = await getOrderById(orderId);
  if (!order) return err("Commande introuvable.");
  if (order.customerId !== customerId) return err("Accès refusé.");

  const [items, events] = await Promise.all([
    getOrderItems(orderId),
    getOrderEvents(orderId),
  ]);

  return ok({ order, items, events });
}

export async function getPublicTrackingOrder(
  trackingToken: string
): Promise<Result<{ order: OrderDetailRecord; items: OrderItemRecord[]; events: OrderEventRecord[] }, string>> {
  if (!trackingToken || trackingToken.trim().length === 0) {
    return err("Jeton de suivi manquant.");
  }

  const order = await getOrderByTrackingToken(trackingToken);
  if (!order) return err("Commande introuvable pour ce lien de suivi.");

  const [items, events] = await Promise.all([
    getOrderItems(order.id),
    getOrderEvents(order.id),
  ]);

  return ok({ order, items, events });
}
