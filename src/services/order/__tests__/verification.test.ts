import { describe, expect, it } from "vitest";
import {
  approvePriceAdjustment,
  declinePriceAdjustment,
  recordPickupCount,
  recordReceptionCount,
  type PickupItemVerificationInput,
  type ReceptionItemVerificationInput,
} from "../verification";

describe("Three-Point Verification & Item Receiving Engine", () => {
  const orderId = "ord_verification_test";

  describe("Point 2: Pickup Verification", () => {
    it("AC 9: requires at least one photo for items flagged valuable or damaged", () => {
      const items: PickupItemVerificationInput[] = [
        {
          orderItemId: "item_silk_1",
          declaredQuantity: 1,
          pickupQuantity: 1,
          isFlagged: true,
          conditionNote: "Delicate silk shirt with fraying",
        },
      ];

      // Missing photo: error!
      const resWithoutPhoto = recordPickupCount(items, {});
      expect(resWithoutPhoto.ok).toBe(false);
      if (!resWithoutPhoto.ok) {
        expect(resWithoutPhoto.error).toContain("requires at least one condition photo");
      }

      // With photo: passes!
      const resWithPhoto = recordPickupCount(items, { item_silk_1: 1 });
      expect(resWithPhoto.ok).toBe(true);
      if (resWithPhoto.ok) {
        expect(resWithPhoto.value.hasCountDiscrepancy).toBe(false);
      }
    });

    it("detects item count discrepancy at pickup", () => {
      const items: PickupItemVerificationInput[] = [
        {
          orderItemId: "item_shirt_1",
          declaredQuantity: 2,
          pickupQuantity: 3, // Customer actually handed 3 shirts
        },
      ];

      const res = recordPickupCount(items, {});
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.hasCountDiscrepancy).toBe(true);
        expect(res.value.totalCounted).toBe(3);
      }
    });
  });

  describe("Point 3: House Reception Count & Adjustments", () => {
    const deliveryFee = 2500;
    const commissionBps = 2000; // 20%

    it("AC 8: creates price adjustment when received count differs from declared order", () => {
      // Declared: 2 shirts @ 3500 CDF = 7000 CDF
      // Received: 3 shirts @ 3500 CDF = 10,500 CDF
      const items: ReceptionItemVerificationInput[] = [
        {
          orderItemId: "oi_1",
          itemId: "itm_shirt",
          unitPrice: 3500,
          declaredQuantity: 2,
          receivedQuantity: 3,
        },
      ];

      const res = recordReceptionCount({
        items,
        houseExclusions: [],
        commissionBps,
        deliveryFee,
      });

      expect(res.hasPriceAdjustment).toBe(true);
      expect(res.suggestedStatus).toBe("price_adjusted");
      expect(res.previousItemsTotal).toBe(7000);
      expect(res.adjustedItemsTotal).toBe(10500);
      expect(res.commissionAmount).toBe(2100); // 20% of 10,500
      expect(res.totalDue).toBe(13000); // 10,500 + 2500
    });

    it("AC 10: marks excluded / non-treated items as returned, removes from cleaning total, and lists for return", () => {
      // Customer sent 1 leather jacket and 1 cotton shirt
      // House excludes leather!
      const items: ReceptionItemVerificationInput[] = [
        {
          orderItemId: "oi_shirt",
          itemId: "itm_shirt",
          unitPrice: 3500,
          declaredQuantity: 1,
          receivedQuantity: 1,
        },
        {
          orderItemId: "oi_leather",
          itemId: "itm_leather_jacket",
          unitPrice: 15000,
          declaredQuantity: 1,
          receivedQuantity: 1,
        },
      ];

      const houseExclusions = [{ itemId: "itm_leather_jacket" }];

      const res = recordReceptionCount({
        items,
        houseExclusions,
        commissionBps,
        deliveryFee,
      });

      expect(res.hasPriceAdjustment).toBe(true);
      expect(res.returnedItems.length).toBe(1);
      expect(res.returnedItems[0]?.itemId).toBe("itm_leather_jacket");
      expect(res.returnedItems[0]?.reason).toContain("House exclusion");

      // Leather jacket completely removed from total! Only the 3500 CDF shirt is charged.
      expect(res.adjustedItemsTotal).toBe(3500);
      expect(res.totalDue).toBe(6000); // 3500 + 2500
      expect(res.acceptedItems.length).toBe(1);
      expect(res.acceptedItems[0]?.itemId).toBe("itm_shirt");
    });
  });

  describe("Price Adjustment Customer Approvals & Declines", () => {
    it("AC 8: approves price adjustment via app and transitions order to washing", () => {
      const res = approvePriceAdjustment({
        orderId,
        approvalMethod: "app",
        actorId: "cust_123",
        actorRole: "customer",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newStatus).toBe("washing");
        expect(res.value.event.approvalMethod).toBe("app");
      }
    });

    it("approves price adjustment on the spot with courier", () => {
      const res = approvePriceAdjustment({
        orderId,
        approvalMethod: "on_the_spot",
        actorId: "cour_123",
        actorRole: "courier",
        note: "Customer verbally consented during physical count",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newStatus).toBe("washing");
        expect(res.value.event.approvalMethod).toBe("on_the_spot");
      }
    });

    it("approves price adjustment by phone recorded by admin", () => {
      const res = approvePriceAdjustment({
        orderId,
        approvalMethod: "phone",
        actorId: "admin_123",
        actorRole: "admin",
        note: "Customer approved via phone call",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newStatus).toBe("washing");
        expect(res.value.event.approvalMethod).toBe("phone");
      }
    });

    it("declines price adjustment and transitions order to price_declined", () => {
      const res = declinePriceAdjustment({
        orderId,
        actorId: "cust_123",
        actorRole: "customer",
        reason: "Adjusted price is higher than expected",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newStatus).toBe("price_declined");
        expect(res.value.event.note).toContain("Adjusted price is higher than expected");
      }
    });
  });
});
