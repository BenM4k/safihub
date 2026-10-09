import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCapturedAnalyticsEvents,
  getCapturedAnalyticsEvents,
  sanitizeAnalyticsProperties,
  sanitizeDistinctId,
} from "../posthog-client";
import {
  trackCartItemAdded,
  trackCheckoutStarted,
  trackCoverageRequested,
  trackCoverageUnavailable,
  trackCustomerReordered,
  trackHouseViewed,
  trackNeighborhoodSelected,
  trackOrderCancelled,
  trackOrderDelivered,
  trackOrderExpired,
  trackOrderPlaced,
  trackPriceAdjusted,
  trackPriceDeclined,
  trackSlotUnavailable,
} from "../analytics.service";

describe("Phase 10.4: PostHog Server-Side Analytics & Privacy Review", () => {
  const userId = "usr_internal_uuid_123";
  const houseId = "house_ibanda_press";
  const neighborhoodId = "neigh_la_botte";
  const itemId = "itm_shirt_formal";
  const orderId = "ord_safihub_999";

  beforeEach(() => {
    clearCapturedAnalyticsEvents();
  });

  describe("Funnel from neighborhood to delivered is visible", () => {
    it("captures the entire customer order funnel in correct sequence", async () => {
      // 1. Customer selects neighborhood
      await trackNeighborhoodSelected({ userId, neighborhoodId });

      // 2. Customer views partner laundry house
      await trackHouseViewed({ userId, houseId });

      // 3. Customer adds item to cart
      await trackCartItemAdded({ userId, houseId, itemId });

      // 4. Customer starts checkout
      await trackCheckoutStarted({ userId, houseId, estimatedTotal: 12500 });

      // 5. Customer places order
      await trackOrderPlaced({
        userId,
        orderId,
        houseId,
        source: "app",
        amount: 12500,
        currency: "CDF",
      });

      // 6. Courier delivers order
      await trackOrderDelivered({ orderId, turnaroundMinutes: 1440 });

      const events = getCapturedAnalyticsEvents();
      expect(events).toHaveLength(6);

      const funnelNames = events.map((e) => e.event);
      expect(funnelNames).toEqual([
        "neighborhood_selected",
        "house_viewed",
        "cart_item_added",
        "checkout_started",
        "order_placed",
        "order_delivered",
      ]);

      // Check properties on order_placed
      const orderPlacedEvent = events.find((e) => e.event === "order_placed");
      expect(orderPlacedEvent).toBeDefined();
      expect(orderPlacedEvent?.distinctId).toBe(userId);
      expect(orderPlacedEvent?.properties).toEqual({
        order_id: orderId,
        house: houseId,
        source: "app",
        amount: 12500,
        currency: "CDF",
      });

      // Check properties on order_delivered
      const orderDeliveredEvent = events.find((e) => e.event === "order_delivered");
      expect(orderDeliveredEvent).toBeDefined();
      expect(orderDeliveredEvent?.properties).toEqual({
        order_id: orderId,
        turnaround_time: 1440,
      });
    });
  });

  describe("All Spec Events Table Coverage", () => {
    it("captures edge and lifecycle events matching section 22 table", async () => {
      await trackCoverageUnavailable({ userId, neighborhoodId });
      await trackCoverageRequested({ userId, neighborhoodId });
      await trackSlotUnavailable({ userId, houseId, slot: "2026-10-12 14:00" });
      await trackOrderExpired({ houseId, orderId });
      await trackOrderCancelled({ orderId, userId, stage: "created", reason: "Client change d'avis" });
      await trackPriceAdjusted({ orderId, houseId, difference: 2000 });
      await trackPriceDeclined({ orderId, houseId, difference: -1500 });
      await trackCustomerReordered({ userId, daysSinceLastOrder: 14 });

      const events = getCapturedAnalyticsEvents();
      const eventNames = events.map((e) => e.event);

      expect(eventNames).toContain("coverage_unavailable");
      expect(eventNames).toContain("coverage_requested");
      expect(eventNames).toContain("slot_unavailable");
      expect(eventNames).toContain("order_expired");
      expect(eventNames).toContain("order_cancelled");
      expect(eventNames).toContain("price_adjusted");
      expect(eventNames).toContain("price_declined");
      expect(eventNames).toContain("customer_reordered");
    });
  });

  describe("Privacy Review: No Personal Data in Events", () => {
    it("strictly scrubs forbidden PII properties (phone, name, address, landmark, email)", () => {
      const maliciousPayload = {
        house: houseId,
        amount: 15000,
        phone: "+243999123456",
        contactPhone: "+243888765432",
        customerPhone: "0999123456",
        name: "Jean Dupont",
        customerName: "Jean Dupont",
        firstName: "Jean",
        lastName: "Dupont",
        address: "Av Mobutu 45, Bukavu",
        customerAddress: "Avenue Patrice Lumumba",
        landmark: "Pres de la cathédrale",
        street: "Rue Principale",
        email: "jean.dupont@example.com",
        customerEmail: "jean@example.com",
        safeMeta: "valide",
      };

      const sanitized = sanitizeAnalyticsProperties(maliciousPayload);

      // Verify forbidden keys are completely stripped
      expect(sanitized).toEqual({
        house: houseId,
        amount: 15000,
        safeMeta: "valide",
      });

      expect(sanitized).not.toHaveProperty("phone");
      expect(sanitized).not.toHaveProperty("contactPhone");
      expect(sanitized).not.toHaveProperty("customerPhone");
      expect(sanitized).not.toHaveProperty("name");
      expect(sanitized).not.toHaveProperty("customerName");
      expect(sanitized).not.toHaveProperty("address");
      expect(sanitized).not.toHaveProperty("landmark");
      expect(sanitized).not.toHaveProperty("street");
      expect(sanitized).not.toHaveProperty("email");
    });

    it("scrubs phone numbers or email strings hiding inside unrestricted keys", () => {
      const trickyPayload = {
        category: "wash",
        nestedInfo: "+243999888777",
        userNote: "customer@gmail.com",
        validCode: "ORD-1234",
      };

      const sanitized = sanitizeAnalyticsProperties(trickyPayload);
      expect(sanitized.category).toBe("wash");
      expect(sanitized.validCode).toBe("ORD-1234");
      expect(sanitized).not.toHaveProperty("nestedInfo");
      expect(sanitized).not.toHaveProperty("userNote");
    });

    it("sanitizes distinctId to prevent leaking phone or email as user identifier", () => {
      const safeId = sanitizeDistinctId("usr_999_uuid");
      expect(safeId).toBe("usr_999_uuid");

      const phoneAsId = sanitizeDistinctId("+243999123456");
      expect(phoneAsId).not.toContain("999123456");
      expect(phoneAsId).toMatch(/^anonymized_/);

      const emailAsId = sanitizeDistinctId("user@example.com");
      expect(emailAsId).not.toContain("user@example.com");
      expect(emailAsId).toMatch(/^anonymized_/);
    });

    it("audits all captured events in the session to ensure zero personal data exists", async () => {
      // Simulate real activity
      await trackNeighborhoodSelected({ userId, neighborhoodId });
      await trackHouseViewed({ userId, houseId });
      await trackCartItemAdded({ userId, houseId, itemId });
      await trackCheckoutStarted({ userId, houseId, estimatedTotal: 9000 });
      await trackOrderPlaced({
        userId,
        orderId,
        houseId,
        source: "app",
        amount: 9000,
        currency: "CDF",
      });
      await trackOrderDelivered({ orderId, turnaroundMinutes: 720 });

      const allEvents = getCapturedAnalyticsEvents();
      expect(allEvents.length).toBeGreaterThan(0);

      // Deep inspection of all captured events
      const phoneRegex = /(?:\+?243[0-9]{9}|0[0-9]{9})/;
      const emailRegex = /\S+@\S+\.\S+/;
      const forbiddenKeyNames = ["phone", "name", "address", "landmark", "street", "email"];

      for (const ev of allEvents) {
        // Distinct ID check
        expect(phoneRegex.test(ev.distinctId)).toBe(false);
        expect(emailRegex.test(ev.distinctId)).toBe(false);

        // Properties check
        for (const [k, v] of Object.entries(ev.properties || {})) {
          const lowerKey = k.toLowerCase();
          for (const forbidden of forbiddenKeyNames) {
            expect(lowerKey).not.toContain(forbidden);
          }
          if (typeof v === "string") {
            expect(phoneRegex.test(v)).toBe(false);
            expect(emailRegex.test(v)).toBe(false);
          }
        }
      }
    });
  });
});
