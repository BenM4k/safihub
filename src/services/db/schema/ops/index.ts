import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user, userRef } from "../auth";
import { createdAt, currencyEnum, id, ts, updatedAt } from "../common";
import { houses } from "../house";
import { missions } from "../mission";
import { disputes, orderItems, orders } from "../order";

export const photoTypeEnum = pgEnum("photo_type", [
  "pickup_condition",
  "delivery_proof",
  "dispute",
]);

export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", [
  "cash_collected",
  "cash_remitted",
  "owed_to_house",
  "owed_to_owner",
  "courier_pay",
  "deposit_held",
  "deposit_released",
  "float_issued",
  "float_returned",
  "house_settlement_paid",
  "courier_pay_paid",
  "discrepancy",
  "reversal",
]);

export const reconciliationStatusEnum = pgEnum("reconciliation_status", [
  "open",
  "confirmed",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "push",
  "sms",
  "whatsapp_link",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);

export type LedgerEntryType = (typeof ledgerEntryTypeEnum.enumValues)[number];

export const settings = pgTable(
  "settings",
  {
    id: smallint("id").primaryKey().default(1),
    defaultCommissionBps: integer("default_commission_bps")
      .notNull()
      .default(2000),
    acceptanceDelayMinutes: integer("acceptance_delay_minutes")
      .notNull()
      .default(45),
    acceptanceReminderPercent: integer("acceptance_reminder_percent")
      .notNull()
      .default(50),
    acceptanceEscalationPercent: integer("acceptance_escalation_percent")
      .notNull()
      .default(75),
    receptionWindowMinutes: integer("reception_window_minutes")
      .notNull()
      .default(60),
    slotLengthMinutes: integer("slot_length_minutes").notNull().default(120),
    maxCoverageDistanceLevel: smallint("max_coverage_distance_level")
      .notNull()
      .default(2),
    defaultCashCeiling: integer("default_cash_ceiling"),
    defaultCourierPayPerLeg: integer("default_courier_pay_per_leg"),
    firstOrderScreening: boolean("first_order_screening")
      .notNull()
      .default(false),
    maxOpenOrdersPerCustomer: integer("max_open_orders_per_customer")
      .notNull()
      .default(2),
    maxItemsPerOrder: integer("max_items_per_order").notNull().default(50),
    maxFreeTextLines: integer("max_free_text_lines").notNull().default(1),
    failedPickupBlockThreshold: integer("failed_pickup_block_threshold")
      .notNull()
      .default(2),
    photoRetentionDays: integer("photo_retention_days").notNull().default(90),
    timezone: text("timezone").notNull().default("Africa/Lubumbashi"),
    updatedAt: updatedAt(),
  },
  (t) => [check("settings_single_row", sql`${t.id} = 1`)]
);

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: id(),
    baseCurrency: currencyEnum("base_currency").notNull(),
    quoteCurrency: currencyEnum("quote_currency").notNull(),
    rate: numeric("rate", { precision: 18, scale: 6 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    setBy: userRef("set_by"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("exchange_rates_pair_date_unique").on(
      t.baseCurrency,
      t.quoteCurrency,
      t.effectiveDate
    ),
    check(
      "exchange_rates_distinct_currencies",
      sql`${t.baseCurrency} <> ${t.quoteCurrency}`
    ),
    check("exchange_rates_positive", sql`${t.rate} > 0`),
  ]
);

export const orderPhotos = pgTable(
  "order_photos",
  {
    id: id(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "set null",
    }),
    missionId: uuid("mission_id").references(() => missions.id, {
      onDelete: "set null",
    }),
    disputeId: uuid("dispute_id").references(() => disputes.id, {
      onDelete: "set null",
    }),
    type: photoTypeEnum("type").notNull(),
    storageKey: text("storage_key").notNull(),
    sizeBytes: integer("size_bytes"),
    takenBy: userRef("taken_by").notNull(),
    createdAt: createdAt(),
    deleteAfter: ts("delete_after"),
    deletedAt: ts("deleted_at"),
  },
  (t) => [
    uniqueIndex("order_photos_storage_key_unique").on(t.storageKey),
    index("order_photos_order_idx").on(t.orderId),
    index("order_photos_retention_idx").on(t.deleteAfter),
  ]
);

export const cashLedger = pgTable(
  "cash_ledger",
  {
    id: id(),
    entryType: ledgerEntryTypeEnum("entry_type").notNull(),
    orderId: uuid("order_id").references(() => orders.id),
    missionId: uuid("mission_id").references(() => missions.id),
    courierId: userRef("courier_id"),
    houseId: uuid("house_id").references(() => houses.id),
    currency: currencyEnum("currency").notNull(),
    amount: integer("amount").notNull(),
    reversalOfId: uuid("reversal_of_id").references(
      (): AnyPgColumn => cashLedger.id
    ),
    note: text("note"),
    createdBy: userRef("created_by"),
    createdAt: createdAt(),
  },
  (t) => [
    index("cash_ledger_courier_idx").on(t.courierId, t.createdAt),
    index("cash_ledger_house_idx").on(t.houseId, t.createdAt),
    index("cash_ledger_order_idx").on(t.orderId),
    check(
      "cash_ledger_reversal_link",
      sql`(${t.entryType} = 'reversal') = (${t.reversalOfId} is not null)`
    ),
  ]
);

export const cashReconciliations = pgTable(
  "cash_reconciliations",
  {
    id: id(),
    courierId: text("courier_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    businessDate: date("business_date").notNull(),
    currency: currencyEnum("currency").notNull(),
    expectedAmount: integer("expected_amount").notNull(),
    receivedAmount: integer("received_amount").notNull(),
    difference: integer("difference").notNull(),
    status: reconciliationStatusEnum("status").notNull().default("open"),
    note: text("note"),
    reconciledBy: userRef("reconciled_by"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("cash_reconciliations_unique").on(
      t.courierId,
      t.businessDate,
      t.currency
    ),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    phone: text("phone"),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    channel: notificationChannelEnum("channel").notNull(),
    templateKey: text("template_key").notNull(),
    locale: text("locale").notNull().default("fr"),
    title: text("title"),
    body: text("body").notNull(),
    status: notificationStatusEnum("status").notNull().default("pending"),
    error: text("error"),
    sentAt: ts("sent_at"),
    readAt: ts("read_at"),
    createdAt: createdAt(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId, t.createdAt),
    index("notifications_status_idx").on(t.status),
    check(
      "notifications_recipient",
      sql`${t.userId} is not null or ${t.phone} is not null`
    ),
  ]
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("push_subscriptions_endpoint_unique").on(t.endpoint),
    index("push_subscriptions_user_idx").on(t.userId),
  ]
);

export type LedgerEntry = typeof cashLedger.$inferSelect;
export type NewLedgerEntry = typeof cashLedger.$inferInsert;
export type Settings = typeof settings.$inferSelect;
