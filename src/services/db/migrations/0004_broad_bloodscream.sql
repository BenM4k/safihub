CREATE TYPE "public"."house_review_status" AS ENUM('draft', 'pending_review', 'approved', 'needs_changes', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partner_onboarding_status" AS ENUM('not_started', 'in_progress', 'skipped', 'completed');--> statement-breakpoint
CREATE TABLE "house_review_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"from_status" "house_review_status" NOT NULL,
	"to_status" "house_review_status" NOT NULL,
	"note" text,
	"performed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"tour_id" text DEFAULT 'partner-main' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "partner_onboarding_status" DEFAULT 'not_started' NOT NULL,
	"last_step_id" text,
	"reminder_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "review_status" "house_review_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "submitted_by" text;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "house_review_events" ADD CONSTRAINT "house_review_events_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_review_events" ADD CONSTRAINT "house_review_events_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_onboarding" ADD CONSTRAINT "partner_onboarding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "house_review_events_house_idx" ON "house_review_events" USING btree ("house_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_onboarding_user_tour_idx" ON "partner_onboarding" USING btree ("user_id","tour_id");--> statement-breakpoint
CREATE INDEX "partner_onboarding_user_idx" ON "partner_onboarding" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "houses_review_status_idx" ON "houses" USING btree ("review_status");