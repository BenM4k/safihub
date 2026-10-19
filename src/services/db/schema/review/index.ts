import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { createdAt, id, ts, updatedAt } from "../common";
import { houses } from "../house";
import { orders } from "../order";

/**
 * Customer reviews for delivered orders.
 * Invariant: exactly one review per delivered order.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    ratingQuality: integer("rating_quality"),
    ratingPunctuality: integer("rating_punctuality"),
    ratingCare: integer("rating_care"),
    ratingValue: integer("rating_value"),
    comment: text("comment"),
    photos: jsonb("photos").$type<string[]>().default([]),
    status: text("status").notNull().default("published"), // 'published' | 'pending' | 'hidden' | 'reported'
    hiddenReason: text("hidden_reason"),
    createdAt: createdAt(),
    editedAt: ts("edited_at"),
  },
  (t) => [
    uniqueIndex("reviews_order_id_unique").on(t.orderId),
    index("reviews_house_status_idx").on(t.houseId, t.status),
    index("reviews_customer_idx").on(t.customerId),
    check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
    check(
      "reviews_rating_quality_range",
      sql`${t.ratingQuality} is null or (${t.ratingQuality} between 1 and 5)`
    ),
    check(
      "reviews_rating_punctuality_range",
      sql`${t.ratingPunctuality} is null or (${t.ratingPunctuality} between 1 and 5)`
    ),
    check(
      "reviews_rating_care_range",
      sql`${t.ratingCare} is null or (${t.ratingCare} between 1 and 5)`
    ),
    check(
      "reviews_rating_value_range",
      sql`${t.ratingValue} is null or (${t.ratingValue} between 1 and 5)`
    ),
  ]
);

/**
 * Public partner replies to customer reviews.
 * One public reply per review.
 */
export const reviewReplies = pgTable(
  "review_replies",
  {
    id: id(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("review_replies_review_id_unique").on(t.reviewId),
    index("review_replies_house_idx").on(t.houseId),
  ]
);

/**
 * Reports flagged on reviews by partner or admin.
 */
export const reviewReports = pgTable(
  "review_reports",
  {
    id: id(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'resolved' | 'dismissed'
    resolvedBy: text("resolved_by").references(() => user.id),
    resolvedAt: ts("resolved_at"),
    createdAt: createdAt(),
  },
  (t) => [
    index("review_reports_review_idx").on(t.reviewId),
    index("review_reports_status_idx").on(t.status),
  ]
);

/**
 * Materialized rating statistics per house.
 */
export const houseRatingStats = pgTable("house_rating_stats", {
  houseId: uuid("house_id")
    .primaryKey()
    .references(() => houses.id, { onDelete: "cascade" }),
  reviewCount: integer("review_count").notNull().default(0),
  ratingSum: integer("rating_sum").notNull().default(0),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
  distribution: jsonb("distribution")
    .$type<Record<string, number>>()
    .notNull()
    .default({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }),
  updatedAt: updatedAt(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewReply = typeof reviewReplies.$inferSelect;
export type NewReviewReply = typeof reviewReplies.$inferInsert;
export type ReviewReport = typeof reviewReports.$inferSelect;
export type NewReviewReport = typeof reviewReports.$inferInsert;
export type HouseRatingStats = typeof houseRatingStats.$inferSelect;
