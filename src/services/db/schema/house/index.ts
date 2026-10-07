import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { fabrics, items, services } from "../catalog";
import { createdAt, currencyEnum, id, ts, updatedAt } from "../common";
import { neighborhoods } from "../coverage";

export const houses = pgTable(
  "houses",
  {
    id: id(),
    name: text("name").notNull(),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id),
    /** Address note for couriers and the admin. Never shown to customers beyond the neighborhood. */
    addressNote: text("address_note"),
    contactPhone: text("contact_phone"),
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("houses_neighborhood_idx").on(t.neighborhoodId),
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

export type House = typeof houses.$inferSelect;
export type NewHouse = typeof houses.$inferInsert;
