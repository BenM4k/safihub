import { pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () => uuid("id").primaryKey().defaultRandom();
export const ts = (name: string) => timestamp(name, { withTimezone: true });
export const createdAt = () => ts("created_at").notNull().defaultNow();
export const updatedAt = () =>
  ts("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const currencyEnum = pgEnum("currency", ["CDF", "USD"]);
export type Currency = (typeof currencyEnum.enumValues)[number];
