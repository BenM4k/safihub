import { test, expect } from "@playwright/test";
import { transitionOrder } from "../src/services/order/transitions";
import { recordPickupCount } from "../src/services/order/verification";
import type { OrderStatus } from "../src/services/db/schema";

test.describe("Flow 2: Price Adjustment on Count Discrepancy", () => {
  test("flags count/fabric discrepancy, blocks washing without approval, and requires explicit customer approval", async () => {
    const orderId = `ord_adj_${Date.now()}`;
    let orderStatus: OrderStatus = "received";

    // 1. Courier arrives and counts items: customer declared 2 items, but hands over 3
    const pickupCountRes = recordPickupCount(
      [
        {
          orderItemId: "item_shirt",
          declaredQuantity: 2,
          pickupQuantity: 3,
          isFlagged: false,
          conditionNote: "Extra shirt added",
        },
      ],
      {}
    );
    expect(pickupCountRes.ok).toBe(true);
    if (pickupCountRes.ok) {
      expect(pickupCountRes.value.hasCountDiscrepancy).toBe(true);
    }

    // 2. Order transitions to price_adjusted (requiring customer approval before washing)
    const triggerAdjustment = transitionOrder(orderId, orderStatus, {
      targetStatus: "price_adjusted",
      actorId: "courier_1",
      actorRole: "courier",
      note: "Extra shirt detected at doorstep. Total updated: +4,500 CDF.",
    });
    expect(triggerAdjustment.ok).toBe(true);
    if (!triggerAdjustment.ok) return;
    orderStatus = triggerAdjustment.value.newStatus;
    expect(orderStatus).toBe("price_adjusted");

    // 3. INVARIANT: House cannot approve its own price adjustment into washing
    const illegalHouseWash = transitionOrder(orderId, orderStatus, {
      targetStatus: "washing",
      actorId: "house_staff",
      actorRole: "house",
    });
    expect(illegalHouseWash.ok).toBe(false);
    if (!illegalHouseWash.ok) {
      expect(illegalHouseWash.error).toContain("is not permitted to perform transition");
    }

    // 3b. Customer cannot transition without an explicit approvalMethod
    const illegalCustomerWash = transitionOrder(orderId, orderStatus, {
      targetStatus: "washing",
      actorId: "cust_123",
      actorRole: "customer",
    });
    expect(illegalCustomerWash.ok).toBe(false);
    if (!illegalCustomerWash.ok) {
      expect(illegalCustomerWash.error).toContain("requires an explicit approvalMethod");
    }

    // 4. Customer approves price adjustment (via tracking link, app, or on-the-spot)
    const approveAdjustment = transitionOrder(orderId, orderStatus, {
      targetStatus: "washing",
      actorId: "cust_123",
      actorRole: "customer",
      approvalMethod: "app",
      note: "Customer approved price adjustment via mobile app",
    });
    expect(approveAdjustment.ok).toBe(true);
    if (!approveAdjustment.ok) return;
    orderStatus = approveAdjustment.value.newStatus;
    expect(orderStatus).toBe("washing");
  });
});
