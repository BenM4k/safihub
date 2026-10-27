import { describe, expect, it } from "vitest";
import {
  db,
  schema,
  getHouseChecklistDerivation,
  transitionHouseReviewStatus,
  getHouseReviewEvents,
} from "@/dal";
import { eq } from "drizzle-orm";

describe("Partner Onboarding Checklist & Review Lifecycle", () => {
  const uniqueId = () => Math.random().toString(36).substring(2, 9);

  async function getBaseFixtures() {
    const [n] = await db
      .select({ id: schema.neighborhoods.id })
      .from(schema.neighborhoods)
      .limit(1);

    const [u] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .limit(1);

    const [s] = await db
      .select({ id: schema.services.id })
      .from(schema.services)
      .limit(1);

    const [f] = await db
      .select({ id: schema.fabrics.id })
      .from(schema.fabrics)
      .limit(1);

    const [i] = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .limit(1);

    return {
      neighborhoodId: n.id,
      userId: u.id,
      serviceId: s.id,
      fabricId: f.id,
      itemId: i.id,
    };
  }

  async function createTestHouse(neighborhoodId: string) {
    const slug = `pressing-test-${uniqueId()}`;
    const [house] = await db
      .insert(schema.houses)
      .values({
        name: "Pressing Test Bukavu",
        slug,
        neighborhoodId,
        addressNote: "Av. Patrice Lumumba, Ibanda",
        contactPhone: "+243991234567",
        minimumOrderAmount: 10000, // 10,000 CDF min order
        reviewStatus: "draft",
      })
      .returning();
    return house;
  }

  it("derives all 7 checklist items correctly and respects the N=1 pricing threshold", async () => {
    const { neighborhoodId } = await getBaseFixtures();
    const house = await createTestHouse(neighborhoodId);

    const checklist = await getHouseChecklistDerivation(house.id);
    expect(checklist).not.toBeNull();
    if (!checklist) return;

    expect(checklist.reviewStatus).toBe("draft");
    expect(checklist.totalRequiredCount).toBe(6);
    expect(checklist.isReadyForSubmission).toBe(false);

    // Item 3: Au moins 1 article avec un prix
    expect(checklist.items.pricing.done).toBe(false);

    // Item 6: Téléphone de contact (house.contactPhone is set)
    expect(checklist.items.contact.done).toBe(true);
    expect(checklist.items.contact.phone).toBe("+243991234567");
  });

  it("detects soft hint when lowest priced item is below minimum order amount", async () => {
    const { neighborhoodId, serviceId, fabricId, itemId } = await getBaseFixtures();
    const house = await createTestHouse(neighborhoodId);

    // Insert a house item with price 3,000 CDF (< 10,000 CDF minimumOrderAmount)
    await db.insert(schema.houseItems).values({
      houseId: house.id,
      serviceId,
      fabricId,
      itemId,
      price: 3000,
      isActive: true,
    });

    const checklist = await getHouseChecklistDerivation(house.id);
    expect(checklist?.items.pricing.hasMinOrderMismatch).toBe(true);
    expect(checklist?.items.pricing.lowestPriceCdf).toBe(3000);
    expect(checklist?.items.pricing.done).toBe(true);
  });

  it("transitions reviewStatus correctly and writes an append-only houseReviewEvents audit log", async () => {
    const { neighborhoodId, userId } = await getBaseFixtures();
    const house = await createTestHouse(neighborhoodId);

    // 1. Submit for review: draft -> pending_review
    await transitionHouseReviewStatus({
      houseId: house.id,
      fromStatus: "draft",
      toStatus: "pending_review",
      performedBy: userId,
    });

    const [afterSubmit] = await db
      .select({ reviewStatus: schema.houses.reviewStatus })
      .from(schema.houses)
      .where(eq(schema.houses.id, house.id));

    expect(afterSubmit.reviewStatus).toBe("pending_review");

    // 2. Admin asks for changes: pending_review -> needs_changes
    await transitionHouseReviewStatus({
      houseId: house.id,
      fromStatus: "pending_review",
      toStatus: "needs_changes",
      performedBy: userId,
      note: "Veuillez préciser vos horaires du samedi.",
    });

    const [afterChanges] = await db
      .select({
        reviewStatus: schema.houses.reviewStatus,
        reviewNote: schema.houses.reviewNote,
      })
      .from(schema.houses)
      .where(eq(schema.houses.id, house.id));

    expect(afterChanges.reviewStatus).toBe("needs_changes");
    expect(afterChanges.reviewNote).toBe("Veuillez préciser vos horaires du samedi.");

    // 3. Verify audit log has 2 events ordered by createdAt desc
    const events = await getHouseReviewEvents(house.id);
    expect(events).toHaveLength(2);
    // Latest event
    expect(events[0].fromStatus).toBe("pending_review");
    expect(events[0].toStatus).toBe("needs_changes");
    expect(events[0].note).toBe("Veuillez préciser vos horaires du samedi.");
    // Earlier event
    expect(events[1].fromStatus).toBe("draft");
    expect(events[1].toStatus).toBe("pending_review");
  });

  it("aborts transaction and throws when fromStatus does not match current house status", async () => {
    const { neighborhoodId, userId } = await getBaseFixtures();
    const house = await createTestHouse(neighborhoodId);

    // house is in draft status, try transitioning from pending_review
    await expect(
      transitionHouseReviewStatus({
        houseId: house.id,
        fromStatus: "pending_review",
        toStatus: "approved",
        performedBy: userId,
      })
    ).rejects.toThrow("Transition conflict");

    // Verify audit log has 0 events and house status remains draft
    const events = await getHouseReviewEvents(house.id);
    expect(events).toHaveLength(0);

    const [currentHouse] = await db
      .select({ reviewStatus: schema.houses.reviewStatus })
      .from(schema.houses)
      .where(eq(schema.houses.id, house.id));
    expect(currentHouse.reviewStatus).toBe("draft");
  });
});
