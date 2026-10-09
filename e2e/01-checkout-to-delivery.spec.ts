import { test, expect } from "@playwright/test";
import {
  transitionOrder,
  transitionMission,
} from "../src/services/order/transitions";
import {
  recordPickupCount,
  recordReceptionCount,
} from "../src/services/order/verification";
import type { OrderStatus, MissionStatus } from "../src/services/db/schema";

test.describe("Flow 1: End-to-End Checkout to Delivery Lifecycle", () => {
  test("completes the full loop: checkout -> house acceptance -> courier pickup -> house wash & ready -> courier delivery & cash collection", async () => {
    const orderId = `ord_e2e_full_${Date.now()}`;
    let orderStatus: OrderStatus = "created";

    // 1. Order is created at checkout
    expect(orderStatus).toBe("created");

    // 2. House accepts order within deadline
    const acceptRes = transitionOrder(orderId, orderStatus, {
      targetStatus: "accepted",
      actorId: "house_staff_ibanda",
      actorRole: "house",
      note: "Commande acceptée par Pressing Bukavu",
    });
    expect(acceptRes.ok).toBe(true);
    if (!acceptRes.ok) return;
    orderStatus = acceptRes.value.newStatus;
    expect(orderStatus).toBe("accepted");

    // 3. Admin dispatches pickup mission to courier
    const assignOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "pickup_assigned",
      actorId: "admin_dispatch",
      actorRole: "admin",
    });
    expect(assignOrder.ok).toBe(true);
    if (!assignOrder.ok) return;
    orderStatus = assignOrder.value.newStatus;

    let pickupStatus: MissionStatus = "unassigned";
    const assignPickup = transitionMission({
      currentStatus: pickupStatus,
      targetStatus: "assigned",
      actorRole: "admin",
    });
    expect(assignPickup.ok).toBe(true);
    if (!assignPickup.ok) return;
    pickupStatus = assignPickup.value;

    // 4. Courier accepts mission
    const acceptPickupMission = transitionMission({
      currentStatus: pickupStatus,
      targetStatus: "accepted",
      actorRole: "courier",
    });
    expect(acceptPickupMission.ok).toBe(true);
    if (!acceptPickupMission.ok) return;
    pickupStatus = acceptPickupMission.value;

    // Courier starts pickup transit
    const startPickup = transitionMission({
      currentStatus: pickupStatus,
      targetStatus: "in_progress",
      actorRole: "courier",
    });
    expect(startPickup.ok).toBe(true);
    if (!startPickup.ok) return;
    pickupStatus = startPickup.value;

    const transitOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "pickup_in_progress",
      actorId: "courier_mukwege",
      actorRole: "courier",
    });
    expect(transitOrder.ok).toBe(true);
    if (!transitOrder.ok) return;
    orderStatus = transitOrder.value.newStatus;

    // Courier counts items at customer doorstep (3 shirts, 2 trousers)
    const countRes = recordPickupCount(
      [
        { orderItemId: "item_shirt", declaredQuantity: 3, pickupQuantity: 3, isFlagged: false },
        { orderItemId: "item_trouser", declaredQuantity: 2, pickupQuantity: 2, isFlagged: false },
      ],
      {}
    );
    expect(countRes.ok).toBe(true);

    const completePickupOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "picked_up",
      actorId: "courier_mukwege",
      actorRole: "courier",
    });
    expect(completePickupOrder.ok).toBe(true);
    if (!completePickupOrder.ok) return;
    orderStatus = completePickupOrder.value.newStatus;
    expect(orderStatus).toBe("picked_up");

    // 5. Laundry House receives clothes and checks them in
    const receiveOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "received",
      actorId: "house_staff_ibanda",
      actorRole: "house",
    });
    expect(receiveOrder.ok).toBe(true);
    if (!receiveOrder.ok) return;
    orderStatus = receiveOrder.value.newStatus;

    const receptionRes = recordReceptionCount({
      items: [
        { orderItemId: "oi_1", itemId: "item_shirt", declaredQuantity: 3, receivedQuantity: 3, unitPrice: 3000 },
        { orderItemId: "oi_2", itemId: "item_trouser", declaredQuantity: 2, receivedQuantity: 2, unitPrice: 4000 },
      ],
      houseExclusions: [],
      commissionBps: 2000,
      deliveryFee: 3000,
    });
    expect(receptionRes.hasPriceAdjustment).toBe(false);

    // 6. House starts washing and marks ready
    const washOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "washing",
      actorId: "house_staff_ibanda",
      actorRole: "house",
    });
    expect(washOrder.ok).toBe(true);
    if (!washOrder.ok) return;
    orderStatus = washOrder.value.newStatus;
    expect(orderStatus).toBe("washing");

    const readyOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "ready",
      actorId: "house_staff_ibanda",
      actorRole: "house",
    });
    expect(readyOrder.ok).toBe(true);
    if (!readyOrder.ok) return;
    orderStatus = readyOrder.value.newStatus;
    expect(orderStatus).toBe("ready");

    // 7. Delivery slot confirmed and mission dispatched
    const confirmSlotOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "delivery_slot_confirmed",
      actorId: "cust_123",
      actorRole: "customer",
    });
    expect(confirmSlotOrder.ok).toBe(true);
    if (!confirmSlotOrder.ok) return;
    orderStatus = confirmSlotOrder.value.newStatus;

    const assignDeliveryOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "delivery_assigned",
      actorId: "admin_dispatch",
      actorRole: "admin",
    });
    expect(assignDeliveryOrder.ok).toBe(true);
    if (!assignDeliveryOrder.ok) return;
    orderStatus = assignDeliveryOrder.value.newStatus;

    const startDeliveryOrder = transitionOrder(orderId, orderStatus, {
      targetStatus: "delivery_in_progress",
      actorId: "courier_mukwege",
      actorRole: "courier",
    });
    expect(startDeliveryOrder.ok).toBe(true);
    if (!startDeliveryOrder.ok) return;
    orderStatus = startDeliveryOrder.value.newStatus;

    // Delivery completed upon cash handover
    const deliverRes = transitionOrder(orderId, orderStatus, {
      targetStatus: "delivered",
      actorId: "courier_mukwege",
      actorRole: "courier",
      note: "Cash collected: 25,000 CDF. Clean clothes handed over.",
    });
    expect(deliverRes.ok).toBe(true);
    if (!deliverRes.ok) return;
    orderStatus = deliverRes.value.newStatus;
    expect(orderStatus).toBe("delivered");
  });
});
