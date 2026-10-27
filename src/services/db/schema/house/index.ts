import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user, userRef } from "../auth";
import { fabrics, items, services } from "../catalog";
import {
  applicationStatusEnum,
  createdAt,
  currencyEnum,
  id,
  ts,
  updatedAt,
} from "../common";
import { neighborhoods } from "../coverage";

export const houseReviewStatusEnum = pgEnum("house_review_status", [
  "draft",
  "pending_review",
  "approved",
  "needs_changes",
  "suspended",
]);

export const partnerOnboardingStatusEnum = pgEnum("partner_onboarding_status", [
  "not_started",
  "in_progress",
  "skipped",
  "completed",
]);

export const houses = pgTable(
  "houses",
  {
    id: id(),
    name: text("name").notNull(),
    /** Unique and stable. Used in URLs: /houses/[slug] for customers and /partner/[slug] for staff. */
    slug: text("slug").notNull(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id),
    /** Address note for couriers and the admin. Never shown to customers beyond the neighborhood. */
    addressNote: text("address_note"),
    contactPhone: text("contact_phone"),
    coverImageUrl: text("cover_image_url"),
    logoUrl: text("logo_url"),
    galleryImages: jsonb("gallery_images").$type<string[]>(),
    description: text("description"),
    /** Null means: use settings.default_commission_bps. The owner's own house can be 0. */
    commissionBps: integer("commission_bps"),
    minimumOrderAmount: integer("minimum_order_amount").notNull().default(0),
    /** The last pickup slot that can be booked ends this many minutes before closing. */
    cutoffMinutes: integer("cutoff_minutes").notNull().default(120),
    turnaroundHours: integer("turnaround_hours").notNull().default(48),
    /** Maximum orders per day. Null means no limit. */
    dailyCapacity: integer("daily_capacity"),
    /** Per-house override of settings.max_coverage_distance_level. */
    maxDistanceLevel: smallint("max_distance_level"),
    isOwnerHouse: boolean("is_owner_house").notNull().default(false),
    /** Set by the admin. */
    isActive: boolean("is_active").notNull().default(true),
    /** Set by the house or admin (temporary pause). */
    isPaused: boolean("is_paused").notNull().default(false),
    pausedUntil: ts("paused_until"),
    /** Review lifecycle: draft | pending_review | approved | needs_changes | suspended */
    reviewStatus: houseReviewStatusEnum("review_status").notNull().default("draft"),
    submittedAt: ts("submitted_at"),
    submittedBy: userRef("submitted_by"),
    reviewedAt: ts("reviewed_at"),
    reviewedBy: userRef("reviewed_by"),
    reviewNote: text("review_note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("houses_slug_unique").on(t.slug),
    index("houses_neighborhood_idx").on(t.neighborhoodId),
    index("houses_review_status_idx").on(t.reviewStatus),
    check(
      "houses_commission_range",
      sql`${t.commissionBps} is null or (${t.commissionBps} between 0 and 10000)`
    ),
    check("houses_min_order_non_negative", sql`${t.minimumOrderAmount} >= 0`),
  ]
);

/** Links house staff accounts to their house. */
export const houseMembers = pgTable(
  "house_members",
  {
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.houseId, t.userId] }),
    index("house_members_user_idx").on(t.userId),
  ]
);

/** Weekly opening hours. Several rows per weekday allow a break in the day. */
export const houseHours = pgTable(
  "house_hours",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(), // 1 = Monday ... 7 = Sunday
    opensAt: time("opens_at").notNull(),
    closesAt: time("closes_at").notNull(),
  },
  (t) => [
    index("house_hours_house_idx").on(t.houseId, t.weekday),
    check("house_hours_weekday_range", sql`${t.weekday} between 1 and 7`),
    check("house_hours_order", sql`${t.closesAt} > ${t.opensAt}`),
  ]
);

/** Closed days, holidays and temporary closures. */
export const houseClosures = pgTable(
  "house_closures",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on").notNull(),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [
    index("house_closures_house_idx").on(t.houseId, t.startsOn),
    check("house_closures_order", sql`${t.endsOn} >= ${t.startsOn}`),
  ]
);

/** Neighborhoods a house chooses to serve, within the service area and its distance limit. */
export const houseCoverage = pgTable(
  "house_coverage",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id),
    isActive: boolean("is_active").notNull().default(true),
    pausedUntil: ts("paused_until"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("house_coverage_unique").on(t.houseId, t.neighborhoodId),
    index("house_coverage_neighborhood_idx").on(t.neighborhoodId),
  ]
);

/** A house's price for a master item: service + item + fabric. */
export const houseItems = pgTable(
  "house_items",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id),
    fabricId: uuid("fabric_id")
      .notNull()
      .references(() => fabrics.id),
    price: integer("price").notNull(),
    currency: currencyEnum("currency").notNull().default("CDF"),
    isActive: boolean("is_active").notNull().default(true),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("house_items_unique").on(
      t.houseId,
      t.serviceId,
      t.itemId,
      t.fabricId
    ),
    index("house_items_house_idx").on(t.houseId, t.isActive),
    check("house_items_price_non_negative", sql`${t.price} >= 0`),
  ]
);

/** Items or fabrics a house does not treat (shown to customers before ordering). */
export const houseExclusions = pgTable(
  "house_exclusions",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => items.id),
    fabricId: uuid("fabric_id").references(() => fabrics.id),
    note: text("note"),
  },
  (t) => [
    index("house_exclusions_house_idx").on(t.houseId),
    check(
      "house_exclusions_target",
      sql`${t.itemId} is not null or ${t.fabricId} is not null`
    ),
  ]
);

/** Public applications from laundries that want to join as partner houses (admin reviews and approves). */
export const houseApplications = pgTable(
  "house_applications",
  {
    id: id(),
    houseName: text("house_name").notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
    /** Free text when the neighborhood is not in the list. */
    neighborhoodText: text("neighborhood_text"),
    addressNote: text("address_note"),
    servicesNote: text("services_note"),
    hoursNote: text("hours_note"),
    message: text("message"),
    status: applicationStatusEnum("status").notNull().default("pending"),
    adminNote: text("admin_note"),
    reviewedBy: userRef("reviewed_by"),
    reviewedAt: ts("reviewed_at"),
    /** Set on approval. */
    createdHouseId: uuid("created_house_id").references(() => houses.id),
    createdAt: createdAt(),
  },
  (t) => [
    index("house_applications_status_idx").on(t.status, t.createdAt),
    check(
      "house_applications_place_given",
      sql`${t.neighborhoodId} is not null or ${t.neighborhoodText} is not null`
    ),
  ]
);

export type House = typeof houses.$inferSelect;
export type NewHouse = typeof houses.$inferInsert;
export type HouseApplication = typeof houseApplications.$inferSelect;
export type NewHouseApplication = typeof houseApplications.$inferInsert;

/** Append-only audit log for pressing review status changes. */
export const houseReviewEvents = pgTable(
  "house_review_events",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    fromStatus: houseReviewStatusEnum("from_status").notNull(),
    toStatus: houseReviewStatusEnum("to_status").notNull(),
    note: text("note"),
    performedBy: userRef("performed_by"),
    createdAt: createdAt(),
  },
  (t) => [
    index("house_review_events_house_idx").on(t.houseId, t.createdAt),
  ]
);

/** Persistent guided tour state per user. */
export const partnerOnboarding = pgTable(
  "partner_onboarding",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tourId: text("tour_id").notNull().default("partner-main"),
    version: integer("version").notNull().default(1),
    status: partnerOnboardingStatusEnum("status").notNull().default("not_started"),
    lastStepId: text("last_step_id"),
    reminderCount: integer("reminder_count").notNull().default(0),
    startedAt: ts("started_at"),
    skippedAt: ts("skipped_at"),
    completedAt: ts("completed_at"),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("partner_onboarding_user_tour_idx").on(t.userId, t.tourId),
    index("partner_onboarding_user_idx").on(t.userId),
  ]
);

export type HouseReviewStatus = (typeof houseReviewStatusEnum.enumValues)[number];
export type PartnerOnboardingStatus = (typeof partnerOnboardingStatusEnum.enumValues)[number];
export type HouseReviewEvent = typeof houseReviewEvents.$inferSelect;
export type NewHouseReviewEvent = typeof houseReviewEvents.$inferInsert;
export type PartnerOnboarding = typeof partnerOnboarding.$inferSelect;
export type NewPartnerOnboarding = typeof partnerOnboarding.$inferInsert;

