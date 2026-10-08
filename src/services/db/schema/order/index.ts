import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { userRef } from "../auth";
import { fabrics, items, services } from "../catalog";
import { createdAt, currencyEnum, id, ts, updatedAt } from "../common";
import { neighborhoods } from "../coverage";
import { houseItems, houses } from "../house";

export const orderSourceEnum = pgEnum("order_source", [
  "app",
  "whatsapp",
  "phone",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "awaiting_confirmation",
  "created",
  "accepted",
  "pickup_assigned",
  "pickup_in_progress",
  "picked_up",
  "received",
  "price_adjusted",
  "washing",
  "ready",
  "delivery_slot_confirmed",
  "delivery_assigned",
  "delivery_in_progress",
  "delivered",
  "rejected",
  "expired",
  "cancelled",
  "pickup_failed",
  "price_declined",
  "delivery_failed",
  "disputed",
]);

export const approvalMethodEnum = pgEnum("approval_method", [
  "app",
  "tracking_link",
  "on_the_spot",
  "phone",
]);

export const orderItemStatusEnum = pgEnum("order_item_status", [
  "accepted",
  "returned",
]);

export const orderEventTypeEnum = pgEnum("order_event_type", [
  "status_change",
  "price_adjustment",
  "approval",
  "assignment",
  "payment",
  "note",
]);

export const disputeTypeEnum = pgEnum("dispute_type", [
  "loss",
  "damage",
  "payment",
  "other",
]);

export const disputeStatusEnum = pgEnum("dispute_status", ["open", "resolved"]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type OrderSource = (typeof orderSourceEnum.enumValues)[number];
export type ApprovalMethod = (typeof approvalMethodEnum.enumValues)[number];
export type OrderItemStatus = (typeof orderItemStatusEnum.enumValues)[number];

export const orders = pgTable(
  "orders",
  {
    id: id(),
    code: text("code").notNull(),
    trackingToken: text("tracking_token").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    customerId: userRef("customer_id").notNull(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id),
    source: orderSourceEnum("source").notNull().default("app"),
    status: orderStatusEnum("status").notNull().default("created"),
    currency: currencyEnum("currency").notNull().default("CDF"),
    neighborhoodId: uuid("neighborhood_id")
      .notNull()
      .references(() => neighborhoods.id),
    landmark: text("landmark").notNull(),
    contactPhone: text("contact_phone").notNull(),
    pickupSlotStart: ts("pickup_slot_start").notNull(),
    pickupSlotEnd: ts("pickup_slot_end").notNull(),
    deliverySlotStart: ts("delivery_slot_start"),
    deliverySlotEnd: ts("delivery_slot_end"),
    estimatedDeliveryAt: ts("estimated_delivery_at"),
    acceptanceDeadlineAt: ts("acceptance_deadline_at"),
    acceptanceReminderSentAt: ts("acceptance_reminder_sent_at"),
    acceptanceEscalatedAt: ts("acceptance_escalated_at"),
    acceptedAt: ts("accepted_at"),
    receivedAt: ts("received_at"),
    receptionDeadlineAt: ts("reception_deadline_at"),
    receptionConfirmedAt: ts("reception_confirmed_at"),
    itemsTotal: integer("items_total").notNull(),
    adjustedItemsTotal: integer("adjusted_items_total"),
    deliveryFee: integer("delivery_fee").notNull(),
    commissionBps: integer("commission_bps").notNull(),
    commissionAmount: integer("commission_amount").notNull(),
    totalDue: integer("total_due").notNull(),
    paymentCurrency: currencyEnum("payment_currency").notNull().default("CDF"),
    exchangeRateUsed: numeric("exchange_rate_used", {
      precision: 18,
      scale: 6,
    }),
    deliveryConfirmationCode: text("delivery_confirmation_code"),
    failedPickupCount: integer("failed_pickup_count").notNull().default(0),
    failedDeliveryCount: integer("failed_delivery_count").notNull().default(0),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("orders_code_unique").on(t.code),
    uniqueIndex("orders_tracking_token_unique").on(t.trackingToken),
    uniqueIndex("orders_customer_idempotency_unique").on(
      t.customerId,
      t.idempotencyKey
    ),
    index("orders_house_status_idx").on(t.houseId, t.status),
    index("orders_customer_idx").on(t.customerId, t.createdAt),
    index("orders_status_deadline_idx").on(t.status, t.acceptanceDeadlineAt),
    index("orders_reception_deadline_idx").on(t.status, t.receptionDeadlineAt),
    check(
      "orders_amounts_non_negative",
      sql`${t.itemsTotal} >= 0 and ${t.deliveryFee} >= 0 and ${t.commissionAmount} >= 0 and ${t.totalDue} >= 0`
    ),
    check(
      "orders_pickup_slot_order",
      sql`${t.pickupSlotEnd} > ${t.pickupSlotStart}`
    ),
    check(
      "orders_delivery_slot_order",
      sql`${t.deliverySlotEnd} is null or ${t.deliverySlotStart} is null or ${t.deliverySlotEnd} > ${t.deliverySlotStart}`
    ),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    houseItemId: uuid("house_item_id").references(() => houseItems.id),
    serviceId: uuid("service_id").references(() => services.id),
    itemId: uuid("item_id").references(() => items.id),
    fabricId: uuid("fabric_id").references(() => fabrics.id),
    customLabel: text("custom_label"),
    declaredQuantity: integer("declared_quantity").notNull(),
    pickupQuantity: integer("pickup_quantity"),
    receivedQuantity: integer("received_quantity"),
    unitPrice: integer("unit_price").notNull().default(0),
    conditionNote: text("condition_note"),
    isFlagged: boolean("is_flagged").notNull().default(false),
    status: orderItemStatusEnum("status").notNull().default("accepted"),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check(
      "order_items_item_or_custom",
      sql`${t.itemId} is not null or ${t.customLabel} is not null`
    ),
    check("order_items_quantities_valid", sql`${t.declaredQuantity} > 0`),
  ]
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: orderEventTypeEnum("type").notNull().default("status_change"),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status"),
    actorId: userRef("actor_id"),
    actorRole: text("actor_role"),
    onBehalfOfHouseId: uuid("on_behalf_of_house_id").references(
      () => houses.id
    ),
    approvalMethod: approvalMethodEnum("approval_method"),
    recordedBy: userRef("recorded_by"),
    note: text("note"),
    payload: jsonb("payload"),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId, t.createdAt)]
);

export const disputes = pgTable(
  "disputes",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    openedBy: userRef("opened_by").notNull(),
    type: disputeTypeEnum("type").notNull(),
    description: text("description").notNull(),
    status: disputeStatusEnum("status").notNull().default("open"),
    resolution: text("resolution"),
    compensationAmount: integer("compensation_amount"),
    currency: currencyEnum("currency").notNull().default("CDF"),
    resolvedBy: userRef("resolved_by"),
    resolvedAt: ts("resolved_at"),
    createdAt: createdAt(),
  },
  (t) => [
    index("disputes_status_idx").on(t.status, t.createdAt),
    index("disputes_order_idx").on(t.orderId),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type NewOrderEvent = typeof orderEvents.$inferInsert;
