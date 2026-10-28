import { describe, expect, it } from "vitest";
import {
  db,
  schema,
  getCustomerHousesList,
  getCustomerHouseDetail,
} from "@/dal";
import { validateOrderCheckout, type OrderValidationContext } from "@/services/order/validation";

describe("Public Visibility Rules & Unapproved Pressing Protection", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  async function getFixtures() {
    const [n] = await db
      .select({ id: schema.neighborhoods.id, zoneId: schema.neighborhoods.zoneId })
      .from(schema.neighborhoods)
      .limit(1);

    const [i] = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .limit(1);

    return {
      neighborhoodId: n.id,
      zoneId: n.zoneId,
      itemId: i.id,
    };
  }

  it("excludes unapproved pressings (draft, pending_review, needs_changes, suspended) from the customer directory", async () => {
    const { neighborhoodId } = await getFixtures();
    const unapprovedSlug = `draft-house-${uniqueId()}`;
    const approvedSlug = `approved-house-${uniqueId()}`;

    // 1. Create draft house
    const [draftHouse] = await db
      .insert(schema.houses)
      .values({
        name: "Pressing Non Validé",
        slug: unapprovedSlug,
        neighborhoodId,
        addressNote: "Av. Maniema, Kadutu",
        contactPhone: "+243990000001",
        reviewStatus: "draft",
        isActive: true,
        isPaused: false,
      })
      .returning();

    // 2. Create approved house
    const [approvedHouse] = await db
      .insert(schema.houses)
      .values({
        name: "Pressing Validé SafiHub",
        slug: approvedSlug,
        neighborhoodId,
        addressNote: "Av. Kibombo, Ibanda",
        contactPhone: "+243990000002",
        reviewStatus: "approved",
        isActive: true,
        isPaused: false,
      })
      .returning();

    // Fetch customer list
    const customerList = await getCustomerHousesList();
    const foundDraft = customerList.find((h) => h.id === draftHouse.id);
    const foundApproved = customerList.find((h) => h.id === approvedHouse.id);

    expect(foundDraft).toBeUndefined();
    expect(foundApproved).toBeDefined();
    expect(foundApproved?.slug).toBe(approvedSlug);

    // Detail query
    const draftDetail = await getCustomerHouseDetail(unapprovedSlug);
    expect(draftDetail?.house.reviewStatus).toBe("draft");

    const approvedDetail = await getCustomerHouseDetail(approvedSlug);
    expect(approvedDetail?.house.reviewStatus).toBe("approved");
  });

  it("server-side checkout rejects orders placed on non-approved pressings", async () => {
    const { neighborhoodId, zoneId, itemId } = await getFixtures();
    const testSlug = `pending-house-${uniqueId()}`;
    const [pendingHouse] = await db
      .insert(schema.houses)
      .values({
        name: "Pressing En Examen",
        slug: testSlug,
        neighborhoodId,
        addressNote: "Av. Paysage, Bagira",
        contactPhone: "+243990000003",
        reviewStatus: "pending_review",
        isActive: true,
        isPaused: false,
      })
      .returning();

    // Validate checkout with non-approved house
    const validationRes = validateOrderCheckout(
      {
        idempotencyKey: crypto.randomUUID(),
        customerId: crypto.randomUUID(),
        houseId: pendingHouse.id,
        customerNeighborhoodId: neighborhoodId,
        landmark: "Test Landmark",
        contactPhone: "+243990000000",
        pickupSlot: { start: new Date(), end: new Date(Date.now() + 7200000) },
        items: [{ serviceId: crypto.randomUUID(), itemId, fabricId: crypto.randomUUID(), quantity: 2 }],
      },
      {
        houses: new Map([
          [
            pendingHouse.id,
            {
              id: pendingHouse.id,
              name: pendingHouse.name,
              slug: pendingHouse.slug,
              neighborhoodId,
              isActive: true,
              isPaused: false,
              pausedUntil: null,
              reviewStatus: "pending_review",
              commissionBps: 2000,
              minimumOrderAmount: 0,
              dailyCapacity: null,
              maxDistanceLevel: 3,
            },
          ],
        ]),
        neighborhoods: new Map([[neighborhoodId, { id: neighborhoodId, zoneId, distanceLevel: 1 }]]),
        zoneFees: [],
        courierShifts: [],
        houseHours: [],
        houseClosures: [],
        houseItems: new Map(),
        masterServices: new Map(),
        masterItems: new Map(),
        masterFabrics: new Map(),
        exclusions: [],
        existingOrders: [],
        settings: { maxItemsPerOrder: 50, exchangeRateCdfPerUsd: 2800 },
        placedOrdersTodayCount: 0,
      } as unknown as OrderValidationContext
    );

    expect(validationRes.ok).toBe(false);
    if (!validationRes.ok) {
      expect(validationRes.error.code).toBe("HOUSE_NOT_AVAILABLE");
    }
  });
});
