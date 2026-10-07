import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  time,
  uuid,
} from "drizzle-orm/pg-core";
import { user, userRef } from "../auth";
import { createdAt, currencyEnum, id, ts, updatedAt } from "../common";
import { orders } from "../order";

export const missionTypeEnum = pgEnum("mission_type", ["pickup", "delivery"]);

export const missionStatusEnum = pgEnum("mission_status", [
  "unassigned",
  "assigned",
  "accepted",
  "in_progress",
  "completed",
  "failed",
]);

export type MissionType = (typeof missionTypeEnum.enumValues)[number];
export type MissionStatus = (typeof missionStatusEnum.enumValues)[number];

export const courierProfiles = pgTable("courier_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "restrict" }),
  cashCeiling: integer("cash_ceiling"),
  securityDeposit: integer("security_deposit").notNull().default(0),
  changeFloat: integer("change_float").notNull().default(0),
  payPerLeg: integer("pay_per_leg"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const courierShifts = pgTable(
  "courier_shifts",
  {
    id: id(),
    courierId: text("courier_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(), // 1 = Monday ... 7 = Sunday
    startsAt: time("starts_at").notNull(),
    endsAt: time("ends_at").notNull(),
  },
  (t) => [
    index("courier_shifts_courier_idx").on(t.courierId, t.weekday),
    check("courier_shifts_weekday_range", sql`${t.weekday} between 1 and 7`),
    check("courier_shifts_order", sql`${t.endsAt} > ${t.startsAt}`),
  ]
);

export const missions = pgTable(
  "missions",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: missionTypeEnum("type").notNull(),
    courierId: userRef("courier_id"),
    status: missionStatusEnum("status").notNull().default("unassigned"),
    slotStart: ts("slot_start").notNull(),
    slotEnd: ts("slot_end").notNull(),
    courierPay: integer("courier_pay"),
    currency: currencyEnum("currency").notNull().default("CDF"),
    startedAt: ts("started_at"),
    completedAt: ts("completed_at"),
    failureReason: text("failure_reason"),
    cashCollected: integer("cash_collected"),
    cashCurrency: currencyEnum("cash_currency"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("missions_courier_status_idx").on(t.courierId, t.status),
    index("missions_order_idx").on(t.orderId, t.type),
    index("missions_status_slot_idx").on(t.status, t.slotStart),
    check("missions_slot_order", sql`${t.slotEnd} > ${t.slotStart}`),
  ]
);

export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;
