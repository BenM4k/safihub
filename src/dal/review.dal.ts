import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { NewReview, NewReviewReply, NewReviewReport, Review, ReviewReply } from "@/services/db/schema/review";

export interface HouseReviewItem extends Review {
  customerFirstName: string;
  customerLastInitial: string;
  reply?: ReviewReply | null;
}

export interface HouseReviewStatsData {
  houseId: string;
  reviewCount: number;
  ratingSum: number;
  averageRating: number | null;
  distribution: Record<string, number>;
}

/**
 * Gets reviews for a pressing with customer privacy protection (First Name + Last Initial).
 */
export async function getHouseReviews(
  houseId: string,
  options: {
    status?: "published" | "all";
    ratingFilter?: number;
    sort?: "recent" | "highest" | "lowest";
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ reviews: HouseReviewItem[]; total: number }> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const conditions = [eq(schema.reviews.houseId, houseId)];
  if (options.status !== "all") {
    conditions.push(eq(schema.reviews.status, "published"));
  }
  if (options.ratingFilter && options.ratingFilter >= 1 && options.ratingFilter <= 5) {
    conditions.push(eq(schema.reviews.rating, options.ratingFilter));
  }

  const whereClause = and(...conditions);

  // Sorting
  let orderByClause = desc(schema.reviews.createdAt);
  if (options.sort === "highest") {
    orderByClause = desc(schema.reviews.rating);
  } else if (options.sort === "lowest") {
    orderByClause = sql`${schema.reviews.rating} ASC`;
  }

  const [reviewsRows, countResult] = await Promise.all([
    db
      .select({
        review: schema.reviews,
        customerName: schema.user.name,
        reply: schema.reviewReplies,
      })
      .from(schema.reviews)
      .innerJoin(schema.user, eq(schema.reviews.customerId, schema.user.id))
      .leftJoin(schema.reviewReplies, eq(schema.reviews.id, schema.reviewReplies.reviewId))
      .where(whereClause)
      .orderBy(orderByClause, desc(schema.reviews.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.reviews)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  const mapped: HouseReviewItem[] = reviewsRows.map((r) => {
    const rawName = r.customerName || "Client";
    const parts = rawName.trim().split(/\s+/);
    const firstName = parts[0] || "Client";
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]?.toUpperCase()}.` : "";

    return {
      ...r.review,
      customerFirstName: firstName,
      customerLastInitial: lastInitial,
      reply: r.reply ?? null,
    };
  });

  return { reviews: mapped, total };
}

/**
 * Gets aggregated review stats for a house.
 */
export async function getHouseRatingStats(houseId: string): Promise<HouseReviewStatsData> {
  const [stats] = await db
    .select()
    .from(schema.houseRatingStats)
    .where(eq(schema.houseRatingStats.houseId, houseId))
    .limit(1);

  if (stats) {
    return {
      houseId: stats.houseId,
      reviewCount: stats.reviewCount,
      ratingSum: stats.ratingSum,
      averageRating: stats.averageRating ? Number(stats.averageRating) : null,
      distribution: stats.distribution ?? { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    };
  }

  // Recalculate on-the-fly if not materialized yet
  return recalculateHouseRatingStats(houseId);
}

/**
 * Recalculates and materializes rating statistics for a house.
 */
export async function recalculateHouseRatingStats(houseId: string): Promise<HouseReviewStatsData> {
  const publishedRows = await db
    .select({
      rating: schema.reviews.rating,
    })
    .from(schema.reviews)
    .where(and(eq(schema.reviews.houseId, houseId), eq(schema.reviews.status, "published")));

  const reviewCount = publishedRows.length;
  let ratingSum = 0;
  const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

  for (const row of publishedRows) {
    ratingSum += row.rating;
    const rKey = String(row.rating);
    distribution[rKey] = (distribution[rKey] || 0) + 1;
  }

  const averageRating = reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : null;

  await db
    .insert(schema.houseRatingStats)
    .values({
      houseId,
      reviewCount,
      ratingSum,
      averageRating: averageRating !== null ? averageRating.toString() : null,
      distribution,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.houseRatingStats.houseId,
      set: {
        reviewCount,
        ratingSum,
        averageRating: averageRating !== null ? averageRating.toString() : null,
        distribution,
        updatedAt: new Date(),
      },
    });

  return {
    houseId,
    reviewCount,
    ratingSum,
    averageRating,
    distribution,
  };
}

/**
 * Finds an existing review by ID.
 */
export async function findReviewById(reviewId: string): Promise<Review | null> {
  const [row] = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.id, reviewId))
    .limit(1);

  return row ?? null;
}

/**
 * Finds an existing review by order ID.
 */
export async function findReviewByOrderId(orderId: string): Promise<Review | null> {
  const [row] = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.orderId, orderId))
    .limit(1);

  return row ?? null;
}

/**
 * Creates a new customer review.
 */
export async function insertReview(data: NewReview): Promise<Review> {
  const [created] = await db.insert(schema.reviews).values(data).returning();
  await recalculateHouseRatingStats(created.houseId);
  return created;
}

/**
 * Updates an existing review (within edit window).
 */
export async function updateReview(
  reviewId: string,
  data: Partial<Omit<NewReview, "id" | "orderId" | "houseId" | "customerId">>
): Promise<Review | null> {
  const [updated] = await db
    .update(schema.reviews)
    .set({ ...data, editedAt: new Date() })
    .where(eq(schema.reviews.id, reviewId))
    .returning();

  if (updated) {
    await recalculateHouseRatingStats(updated.houseId);
  }
  return updated ?? null;
}

/**
 * Inserts a partner reply for a review.
 */
export async function insertReviewReply(data: NewReviewReply): Promise<ReviewReply> {
  const [created] = await db.insert(schema.reviewReplies).values(data).returning();
  return created;
}

/**
 * Inserts a report on a review.
 */
export async function insertReviewReport(data: NewReviewReport) {
  const [created] = await db.insert(schema.reviewReports).values(data).returning();
  return created;
}

/**
 * Moderates a review (e.g. hides or restores it).
 */
export async function setReviewModerationStatus(
  reviewId: string,
  status: "published" | "hidden" | "pending",
  hiddenReason?: string | null
): Promise<Review | null> {
  const [updated] = await db
    .update(schema.reviews)
    .set({
      status,
      hiddenReason: hiddenReason ?? null,
      editedAt: new Date(),
    })
    .where(eq(schema.reviews.id, reviewId))
    .returning();

  if (updated) {
    await recalculateHouseRatingStats(updated.houseId);
  }
  return updated ?? null;
}

/**
 * Finds delivered orders by this customer for this house that haven't been reviewed yet.
 */
export async function getCustomerDeliveredOrdersEligibleForReview(
  customerId: string,
  houseId: string
): Promise<Array<{ id: string; createdAt: Date }>> {
  const eligibleOrders = await db
    .select({
      id: schema.orders.id,
      createdAt: schema.orders.createdAt,
    })
    .from(schema.orders)
    .leftJoin(schema.reviews, eq(schema.orders.id, schema.reviews.orderId))
    .where(
      and(
        eq(schema.orders.customerId, customerId),
        eq(schema.orders.houseId, houseId),
        eq(schema.orders.status, "delivered"),
        sql`${schema.reviews.id} IS NULL`
      )
    )
    .orderBy(desc(schema.orders.createdAt))
    .limit(5);

  return eligibleOrders;
}
