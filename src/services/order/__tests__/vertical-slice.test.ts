import { describe, expect, it } from "vitest";
import {
  transitionOrder,
  transitionMission,
  recordPickupCount,
  recordReceptionCount,
} from "@/services/order";
import type { OrderStatus, MissionStatus, ApprovalMethod } from "@/services/db/schema";
import type { Result } from "@/lib/result";

function unwrap<T>(res: Result<T, unknown>): T {
  if (!res.ok) throw new Error(String(res.error));
  return res.value;
}

describe("Checkpoint 6: Vertical Slice End-to-End Order Lifecycle", () => {
  it("runs one complete order from checkout to delivery: house accepts -> courier picks up & counts -> house receives -> marks ready -> delivery slot -> courier delivers -> cash collected", () => {
    const orderId = "ord_vertical_slice_001";
    let orderStatus: OrderStatus = "created";
    const events: Array<{ type: string; from: OrderStatus | null; to: OrderStatus; actorRole: string }> = [];

    // Helper to transition order and track event history
    function stepOrder(
      toStatus: OrderStatus,
      actorRole: "customer" | "house" | "courier" | "admin" | "system",
      options?: { onBehalfOfHouseId?: string; reason?: string; approvalMethod?: ApprovalMethod; note?: string }
    ) {
      const res = transitionOrder(orderId, orderStatus, {
        targetStatus: toStatus,
        actorId: `usr_${actorRole}`,
        actorRole,
        ...options,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        events.push({
          type: res.value.event.type,
          from: res.value.previousStatus,
          to: res.value.newStatus,
          actorRole,
        });
        orderStatus = res.value.newStatus;
      }
    }

    // --- STEP 1: House accepts order ---
    expect(orderStatus).toBe("created");
    stepOrder("accepted", "house", { note: "Pressing Kivu Pro a accepté la commande" });
    expect(orderStatus).toBe("accepted");

    // --- STEP 2: Admin dispatches pickup mission to courier ---
    let pickupMissionStatus: MissionStatus = "unassigned";
    const dispatchPickupRes = transitionMission({
      currentStatus: pickupMissionStatus,
      targetStatus: "assigned",
      actorRole: "admin",
    });
    expect(dispatchPickupRes.ok).toBe(true);
    pickupMissionStatus = unwrap(dispatchPickupRes);

    stepOrder("pickup_assigned", "admin");
    expect(orderStatus).toBe("pickup_assigned");

    // --- STEP 3: Courier accepts pickup mission ---
    const acceptPickupRes = transitionMission({
      currentStatus: pickupMissionStatus,
      targetStatus: "accepted",
      actorRole: "courier",
    });
    expect(acceptPickupRes.ok).toBe(true);
    pickupMissionStatus = unwrap(acceptPickupRes);
    expect(pickupMissionStatus).toBe("accepted");

    // --- STEP 4: Courier starts pickup ---
    const startPickupRes = transitionMission({
      currentStatus: pickupMissionStatus,
      targetStatus: "in_progress",
      actorRole: "courier",
    });
    expect(startPickupRes.ok).toBe(true);
    pickupMissionStatus = unwrap(startPickupRes);

    stepOrder("pickup_in_progress", "courier", { note: "Coursier en route chez le client" });
    expect(orderStatus).toBe("pickup_in_progress");

    // --- STEP 5: Courier physically counts with customer on-site ---
    const pickupCountRes = recordPickupCount(
      [
        {
          orderItemId: "oi_1",
          declaredQuantity: 2,
          pickupQuantity: 2,
          conditionNote: "Col propre",
          isFlagged: false,
        },
        {
          orderItemId: "oi_2",
          declaredQuantity: 1,
          pickupQuantity: 1,
          isFlagged: false,
        },
      ],
      {}
    );
    expect(pickupCountRes.ok).toBe(true);
    expect(unwrap(pickupCountRes).hasCountDiscrepancy).toBe(false);

    // Complete pickup mission
    const completePickupRes = transitionMission({
      currentStatus: pickupMissionStatus,
      targetStatus: "completed",
      actorRole: "courier",
    });
    expect(completePickupRes.ok).toBe(true);
    pickupMissionStatus = unwrap(completePickupRes);

    stepOrder("picked_up", "courier", { note: "3 articles collectés et ensachés" });
    expect(orderStatus).toBe("picked_up");

    // --- STEP 6: Laundry house receives garments and verifies count ---
    stepOrder("received", "house", { note: "Réceptionné et vérifié par l'atelier" });
    expect(orderStatus).toBe("received");

    const receptionCountRes = recordReceptionCount({
      items: [
        {
          orderItemId: "oi_1",
          itemId: "itm_chemise",
          unitPrice: 3500,
          declaredQuantity: 2,
          receivedQuantity: 2,
        },
        {
          orderItemId: "oi_2",
          itemId: "itm_pantalon",
          unitPrice: 4000,
          declaredQuantity: 1,
          receivedQuantity: 1,
        },
      ],
      houseExclusions: [],
      commissionBps: 2000,
      deliveryFee: 2500,
    });
    expect(receptionCountRes.hasPriceAdjustment).toBe(false);
    expect(receptionCountRes.suggestedStatus).toBe("washing");

    // No discrepancy: transitions directly to washing
    stepOrder("washing", "house", { note: "Lavage en cours" });
    expect(orderStatus).toBe("washing");

    // --- STEP 7: House marks laundry ready ---
    stepOrder("ready", "house", { note: "Linge propre, séché, repassé et emballé" });
    expect(orderStatus).toBe("ready");

    // --- STEP 8: Delivery slot confirmed by customer ---
    stepOrder("delivery_slot_confirmed", "customer", { note: "Créneau de livraison 14h-16h confirmé" });
    expect(orderStatus).toBe("delivery_slot_confirmed");

    // --- STEP 9: Admin dispatches delivery mission to courier ---
    let deliveryMissionStatus: MissionStatus = "unassigned";
    const dispatchDeliveryRes = transitionMission({
      currentStatus: deliveryMissionStatus,
      targetStatus: "assigned",
      actorRole: "admin",
    });
    expect(dispatchDeliveryRes.ok).toBe(true);
    deliveryMissionStatus = unwrap(dispatchDeliveryRes);

    stepOrder("delivery_assigned", "admin");
    expect(orderStatus).toBe("delivery_assigned");

    // --- STEP 10: Courier accepts delivery mission ---
    const acceptDeliveryRes = transitionMission({
      currentStatus: deliveryMissionStatus,
      targetStatus: "accepted",
      actorRole: "courier",
    });
    expect(acceptDeliveryRes.ok).toBe(true);
    deliveryMissionStatus = unwrap(acceptDeliveryRes);

    // --- STEP 11: Courier starts delivery ---
    const startDeliveryRes = transitionMission({
      currentStatus: deliveryMissionStatus,
      targetStatus: "in_progress",
      actorRole: "courier",
    });
    expect(startDeliveryRes.ok).toBe(true);
    deliveryMissionStatus = unwrap(startDeliveryRes);

    stepOrder("delivery_in_progress", "courier", { note: "Coursier en route avec le linge propre" });
    expect(orderStatus).toBe("delivery_in_progress");

    // --- STEP 12: Courier collects cash, verifies confirmation code, hands over clean garments ---
    const completeDeliveryRes = transitionMission({
      currentStatus: deliveryMissionStatus,
      targetStatus: "completed",
      actorRole: "courier",
    });
    expect(completeDeliveryRes.ok).toBe(true);
    deliveryMissionStatus = unwrap(completeDeliveryRes);

    stepOrder("delivered", "courier", { note: "Code 4829 vérifié. Espèces perçues : 13,500 CDF" });
    expect(orderStatus).toBe("delivered");

    // Verify all transition events occurred in proper sequence
    expect(events.length).toBe(11);
    expect(events.map((e) => e.to)).toEqual([
      "accepted",
      "pickup_assigned",
      "pickup_in_progress",
      "picked_up",
      "received",
      "washing",
      "ready",
      "delivery_slot_confirmed",
      "delivery_assigned",
      "delivery_in_progress",
      "delivered",
    ]);
  });
});
