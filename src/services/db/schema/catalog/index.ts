import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { userRef } from "../auth";
import { createdAt, id, ts } from "../common";
import { houses } from "../house";

export const itemRequestKindEnum = pgEnum("item_request_kind", [
  "item",
  "fabric",
]);

export const itemRequestStatusEnum = pgEnum("item_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const services = pgTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(), // wash, iron, dry_clean...
  nameFr: text("name_fr").notNull(),
  nameSw: text("name_sw").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const items = pgTable("items", {
  id: id(),
  nameFr: text("name_fr").notNull(),
  nameSw: text("name_sw").notNull(),
  category: text("category"), // for example: tops, bottoms, bedding
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

/** Include a neutral fabric such as "Standard" so every house item can have a fabric. */
export const fabrics = pgTable("fabrics", {
  id: id(),
  nameFr: text("name_fr").notNull(),
  nameSw: text("name_sw").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

/** A house asks for a new item or fabric; the admin approves it into the master lists. */
export const itemRequests = pgTable(
  "item_requests",
  {
    id: id(),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    requestedBy: userRef("requested_by").notNull(),
    kind: itemRequestKindEnum("kind").notNull(),
    name: text("name").notNull(),
    note: text("note"),
    status: itemRequestStatusEnum("status").notNull().default("pending"),
    adminNote: text("admin_note"),
    /** Result after approval. */
    createdItemId: uuid("created_item_id").references(() => items.id),
    createdFabricId: uuid("created_fabric_id").references(() => fabrics.id),
    resolvedBy: userRef("resolved_by"),
    resolvedAt: ts("resolved_at"),
    createdAt: createdAt(),
  },
  (t) => [index("item_requests_status_idx").on(t.status)]
);
