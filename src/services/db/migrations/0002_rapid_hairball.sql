CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "house_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"neighborhood_id" uuid,
	"neighborhood_text" text,
	"address_note" text,
	"services_note" text,
	"hours_note" text,
	"message" text,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_house_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "house_applications_place_given" CHECK ("house_applications"."neighborhood_id" is not null or "house_applications"."neighborhood_text" is not null)
);
--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "houses" SET "slug" = 'pressing-du-lac-kivu' WHERE "name" = 'Pressing du Lac Kivu' AND "slug" IS NULL;--> statement-breakpoint
UPDATE "houses" SET "slug" = 'pressing-etoile-de-kadutu' WHERE "name" = 'Pressing Étoile de Kadutu' AND "slug" IS NULL;--> statement-breakpoint
UPDATE "houses" SET "slug" = 'house-' || "id" WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "houses" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "house_applications" ADD CONSTRAINT "house_applications_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_applications" ADD CONSTRAINT "house_applications_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_applications" ADD CONSTRAINT "house_applications_created_house_id_houses_id_fk" FOREIGN KEY ("created_house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "house_applications_status_idx" ON "house_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "houses_slug_unique" ON "houses" USING btree ("slug");