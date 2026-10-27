import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type {
  House,
  HouseReviewEvent,
  HouseReviewStatus,
} from "@/services/db/schema";

export type { House, HouseReviewEvent, HouseReviewStatus };

export interface HouseChecklistDerivation {
  houseId: string;
  houseSlug: string;
  houseName: string;
  reviewStatus: HouseReviewStatus;
  reviewNote: string | null;
  submittedAt: Date | null;
  items: {
    photos: { done: boolean; coverImageUrl: string | null; logoUrl: string | null };
    hours: { done: boolean; count: number };
    pricing: {
      done: boolean;
      pricedCount: number;
      lowestPriceCdf: number | null;
      minimumOrderAmount: number;
      hasMinOrderMismatch: boolean;
      minOrderHint?: string;
    };
    coverage: { done: boolean; count: number };
    payment: { done: boolean };
    contact: { done: boolean; phone: string | null };
  };
  completedCount: number;
  totalRequiredCount: number; // 6 required before submission
  isReadyForSubmission: boolean;
}

export async function getHouseChecklistDerivation(
  houseId: string
): Promise<HouseChecklistDerivation | null> {
  const [house] = await db
    .select({
      id: schema.houses.id,
      slug: schema.houses.slug,
      name: schema.houses.name,
      coverImageUrl: schema.houses.coverImageUrl,
      logoUrl: schema.houses.logoUrl,
      contactPhone: schema.houses.contactPhone,
      minimumOrderAmount: schema.houses.minimumOrderAmount,
      reviewStatus: schema.houses.reviewStatus,
      reviewNote: schema.houses.reviewNote,
      submittedAt: schema.houses.submittedAt,
    })
    .from(schema.houses)
    .where(eq(schema.houses.id, houseId))
    .limit(1);

  if (!house) return null;

  const [hoursCountResult, coverageCountResult, pricedItemsResult] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.houseHours)
        .where(eq(schema.houseHours.houseId, houseId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.houseCoverage)
        .where(
          and(
            eq(schema.houseCoverage.houseId, houseId),
            eq(schema.houseCoverage.isActive, true)
          )
        ),
      db
        .select({
          count: sql<number>`count(*)::int`,
          minPrice: sql<number | null>`min(${schema.houseItems.price})`,
        })
        .from(schema.houseItems)
        .where(
          and(
            eq(schema.houseItems.houseId, houseId),
            eq(schema.houseItems.isActive, true),
            sql`${schema.houseItems.price} > 0`
          )
        ),
    ]);

  const hoursCount = hoursCountResult[0]?.count ?? 0;
  const coverageCount = coverageCountResult[0]?.count ?? 0;
  const pricedCount = pricedItemsResult[0]?.count ?? 0;
  const lowestPriceCdf = pricedItemsResult[0]?.minPrice ?? null;

  const photosDone = Boolean(house.coverImageUrl || house.logoUrl);
  const hoursDone = hoursCount > 0;
  const pricingDone = pricedCount >= 1;
  const coverageDone = coverageCount > 0;
  const hasPhone = Boolean(house.contactPhone && house.contactPhone.trim().length >= 6);
  const paymentDone = hasPhone; // Linked Mobile Money / banking contact
  const contactDone = hasPhone;

  const hasMinOrderMismatch =
    pricingDone &&
    lowestPriceCdf !== null &&
    house.minimumOrderAmount > 0 &&
    lowestPriceCdf < house.minimumOrderAmount;

  const minOrderHint = hasMinOrderMismatch
    ? "Votre prix le plus bas est inférieur au minimum de commande : les clients ne pourront pas commander cet article seul."
    : undefined;

  const itemDones = [
    photosDone,
    hoursDone,
    pricingDone,
    coverageDone,
    paymentDone,
    contactDone,
  ];
  const completedCount = itemDones.filter(Boolean).length;
  const totalRequiredCount = 6;
  const isReadyForSubmission = completedCount === totalRequiredCount;

  return {
    houseId: house.id,
    houseSlug: house.slug,
    houseName: house.name,
    reviewStatus: house.reviewStatus,
    reviewNote: house.reviewNote,
    submittedAt: house.submittedAt,
    items: {
      photos: {
        done: photosDone,
        coverImageUrl: house.coverImageUrl,
        logoUrl: house.logoUrl,
      },
      hours: { done: hoursDone, count: hoursCount },
      pricing: {
        done: pricingDone,
        pricedCount,
        lowestPriceCdf,
        minimumOrderAmount: house.minimumOrderAmount,
        hasMinOrderMismatch,
        minOrderHint,
      },
      coverage: { done: coverageDone, count: coverageCount },
      payment: { done: paymentDone },
      contact: { done: contactDone, phone: house.contactPhone },
    },
    completedCount,
    totalRequiredCount,
    isReadyForSubmission,
  };
}

export async function transitionHouseReviewStatus(params: {
  houseId: string;
  fromStatus: HouseReviewStatus;
  toStatus: HouseReviewStatus;
  note?: string | null;
  performedBy?: string | null;
}): Promise<House> {
  const now = new Date();

  return await db.transaction(async (tx) => {
    const updatePayload: Partial<typeof schema.houses.$inferInsert> = {
      reviewStatus: params.toStatus,
      updatedAt: now,
    };

    if (params.toStatus === "pending_review") {
      updatePayload.submittedAt = now;
      updatePayload.submittedBy = params.performedBy ?? null;
    } else if (params.toStatus === "approved" || params.toStatus === "needs_changes") {
      updatePayload.reviewedAt = now;
      updatePayload.reviewedBy = params.performedBy ?? null;
      updatePayload.reviewNote = params.note ?? null;
    } else if (params.toStatus === "suspended") {
      updatePayload.reviewedAt = now;
      updatePayload.reviewedBy = params.performedBy ?? null;
      updatePayload.reviewNote = params.note ?? null;
    }

    const [updated] = await tx
      .update(schema.houses)
      .set(updatePayload)
      .where(
        and(
          eq(schema.houses.id, params.houseId),
          eq(schema.houses.reviewStatus, params.fromStatus)
        )
      )
      .returning();

    if (!updated) {
      throw new Error(
        `Transition conflict: house ${params.houseId} is not in expected status ${params.fromStatus}`
      );
    }

    await tx.insert(schema.houseReviewEvents).values({
      houseId: params.houseId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      note: params.note ?? null,
      performedBy: params.performedBy ?? null,
      createdAt: now,
    });

    return updated;
  });
}

export async function getHouseReviewEvents(
  houseId: string
): Promise<HouseReviewEvent[]> {
  return await db
    .select()
    .from(schema.houseReviewEvents)
    .where(eq(schema.houseReviewEvents.houseId, houseId))
    .orderBy(desc(schema.houseReviewEvents.createdAt));
}

export interface AdminPendingReviewRow {
  houseId: string;
  name: string;
  slug: string;
  reviewStatus: HouseReviewStatus;
  reviewNote: string | null;
  submittedAt: Date | null;
  submittedBy: string | null;
  contactPhone: string | null;
  neighborhoodName: string;
  pricedItemsCount: number;
  completedChecklistCount: number;
}

export async function listAdminPendingHouseReviews(statusFilter?: HouseReviewStatus): Promise<AdminPendingReviewRow[]> {
  const query = db
    .select({
      houseId: schema.houses.id,
      name: schema.houses.name,
      slug: schema.houses.slug,
      reviewStatus: schema.houses.reviewStatus,
      reviewNote: schema.houses.reviewNote,
      submittedAt: schema.houses.submittedAt,
      submittedBy: schema.houses.submittedBy,
      contactPhone: schema.houses.contactPhone,
      coverImageUrl: schema.houses.coverImageUrl,
      logoUrl: schema.houses.logoUrl,
      neighborhoodName: schema.neighborhoods.name,
    })
    .from(schema.houses)
    .innerJoin(
      schema.neighborhoods,
      eq(schema.houses.neighborhoodId, schema.neighborhoods.id)
    );

  const rawHouses = statusFilter
    ? await query.where(eq(schema.houses.reviewStatus, statusFilter)).orderBy(desc(schema.houses.submittedAt))
    : await query.where(eq(schema.houses.reviewStatus, "pending_review")).orderBy(desc(schema.houses.submittedAt));

  const rows: AdminPendingReviewRow[] = [];

  for (const h of rawHouses) {
    const checklist = await getHouseChecklistDerivation(h.houseId);
    rows.push({
      houseId: h.houseId,
      name: h.name,
      slug: h.slug,
      reviewStatus: h.reviewStatus,
      reviewNote: h.reviewNote,
      submittedAt: h.submittedAt,
      submittedBy: h.submittedBy,
      contactPhone: h.contactPhone,
      neighborhoodName: h.neighborhoodName,
      pricedItemsCount: checklist?.items.pricing.pricedCount ?? 0,
      completedChecklistCount: checklist?.completedCount ?? 0,
    });
  }

  return rows;
}
