import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth";
import { createdAt, currencyEnum, id, ts, updatedAt } from "../common";

export const neighborhoodStatusEnum = pgEnum("neighborhood_status", [
  "served",
  "paused",
  "not_served",
]);

export const zones = pgTable("zones", {
  id: id(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const neighborhoods = pgTable(
  "neighborhoods",
  {
    id: id(),
    name: text("name").notNull().unique(),
    zoneId: uuid("zone_id")
      .notNull()
      .references(() => zones.id),
    /** Only the admin decides which neighborhoods are served. */
    status: neighborhoodStatusEnum("status").notNull().default("not_served"),
    pauseReason: text("pause_reason"),
    pausedUntil: ts("paused_until"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("neighborhoods_zone_idx").on(t.zoneId),
    index("neighborhoods_status_idx").on(t.status),
  ]
);

/**
 * Matrix between zones: (customer zone, house zone) -> delivery fee and distance level.
 * No row for a pair means no coverage for that pair.
 */
export const zoneFees = pgTable(
  "zone_fees",
  {
    id: id(),
    customerZoneId: uuid("customer_zone_id")
      .notNull()
      .references(() => zones.id),
    houseZoneId: uuid("house_zone_id")
      .notNull()
      .references(() => zones.id),
    deliveryFee: integer("delivery_fee").notNull(),
    currency: currencyEnum("currency").notNull().default("CDF"),
    /** 1 = same zone, 2 = neighboring zone, 3 = far (admin decides the scale). */
    distanceLevel: smallint("distance_level").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("zone_fees_pair_unique").on(t.customerZoneId, t.houseZoneId),
    check("zone_fees_fee_non_negative", sql`${t.deliveryFee} >= 0`),
    check("zone_fees_level_positive", sql`${t.distanceLevel} >= 1`),
  ]
);

/** Visitors who ask for service in a neighborhood that is not served yet. */
export const coverageRequests = pgTable(
  "coverage_requests",
  {
    id: id(),
    phone: text("phone").notNull(),
    neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
    /** Free text when the neighborhood is not in the list. */
    neighborhoodText: text("neighborhood_text"),
    userId: text("user_id").references(() => user.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    notifiedAt: ts("notified_at"),
  },
  (t) => [
    index("coverage_requests_neighborhood_idx").on(t.neighborhoodId),
    check(
      "coverage_requests_place_given",
      sql`${t.neighborhoodId} is not null or ${t.neighborhoodText} is not null`
    ),
  ]
);

/** A mission can go only to a courier covering both the customer's zone and the house's zone. */
export const courierZones = pgTable(
  "courier_zones",
  {
    courierId: text("courier_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    zoneId: uuid("zone_id")
      .notNull()
      .references(() => zones.id),
  },
  (t) => [primaryKey({ columns: [t.courierId, t.zoneId] })]
);
