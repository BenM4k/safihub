import { test, expect } from "@playwright/test";
import { transitionOrder } from "../src/services/order/transitions";
import { computeAcceptanceDeadlines } from "../src/services/order/deadlines";
import type { OrderStatus } from "../src/services/db/schema";

test.describe("Flow 3: Acceptance Expiry & Alternative House Switching", () => {
  test("expires order when house fails to accept within opening-hours deadline", async () => {
    const orderId = `ord_expiry_${Date.now()}`;
    let orderStatus: OrderStatus = "created";

    // 1. Order is placed during house opening hours
    const houseSchedule = [
      { id: "h1", houseId: "house_1", weekday: 1, opensAt: "08:00", closesAt: "18:00" }, // Monday
      { id: "h2", houseId: "house_1", weekday: 2, opensAt: "08:00", closesAt: "18:00" }, // Tuesday
    ];

    // Order placed on Monday at 10:00 AM
    const orderPlacedTime = new Date("2026-10-12T10:00:00Z");
    const deadlines = computeAcceptanceDeadlines(orderPlacedTime, 45, houseSchedule, []); // 45 min
    expect(deadlines.deadlineAt.getTime()).toBe(new Date("2026-10-12T10:45:00Z").getTime());

    // 2. 45 minutes pass without house acceptance -> system transitions order to 'expired'
    const expireRes = transitionOrder(orderId, orderStatus, {
      targetStatus: "expired",
      actorId: "system_inngest_cron",
      actorRole: "system",
      reason: "House did not accept within the 45-minute opening hours window",
    });
    expect(expireRes.ok).toBe(true);
    if (!expireRes.ok) return;
    orderStatus = expireRes.value.newStatus;
    expect(orderStatus).toBe("expired");

    // 3. INVARIANT: Expired orders cannot be resurrected into 'washing'
    const invalidWash = transitionOrder(orderId, orderStatus, {
      targetStatus: "washing",
      actorId: "house_staff",
      actorRole: "house",
    });
    expect(invalidWash.ok).toBe(false);
  });
});
