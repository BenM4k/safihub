ALTER TABLE "notifications" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "next_retry_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_dedupe_key_unique" ON "notifications" USING btree ("dedupe_key") WHERE "notifications"."dedupe_key" is not null;--> statement-breakpoint
CREATE INDEX "notifications_outbox_retry_idx" ON "notifications" USING btree ("status","next_retry_at") WHERE "notifications"."user_id" is null;