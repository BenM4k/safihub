CREATE TYPE "public"."house_member_role" AS ENUM('owner', 'manager', 'operator');--> statement-breakpoint
ALTER TABLE "house_members" ADD COLUMN "role" "house_member_role" DEFAULT 'owner' NOT NULL;--> statement-breakpoint
CREATE INDEX "courier_zones_zone_idx" ON "courier_zones" USING btree ("zone_id","courier_id");--> statement-breakpoint
CREATE INDEX "houses_active_approved_idx" ON "houses" USING btree ("is_active","review_status") WHERE "houses"."is_active" = true and "houses"."review_status" = 'approved';--> statement-breakpoint
CREATE INDEX "cash_ledger_reversal_of_idx" ON "cash_ledger" USING btree ("reversal_of_id") WHERE "cash_ledger"."reversal_of_id" is not null;--> statement-breakpoint
CREATE INDEX "cash_ledger_courier_type_created_idx" ON "cash_ledger" USING btree ("courier_id","entry_type","created_at");--> statement-breakpoint
CREATE INDEX "cash_ledger_house_type_created_idx" ON "cash_ledger" USING btree ("house_id","entry_type","created_at");--> statement-breakpoint
CREATE INDEX "orders_contact_phone_created_idx" ON "orders" USING btree ("contact_phone","created_at");--> statement-breakpoint
CREATE INDEX "orders_house_pickup_slot_idx" ON "orders" USING btree ("house_id","pickup_slot_start");