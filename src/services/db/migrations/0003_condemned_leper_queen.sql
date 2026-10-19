CREATE TABLE "house_rating_stats" (
	"house_id" uuid PRIMARY KEY NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2),
	"distribution" jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"house_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"house_id" uuid NOT NULL,
	"customer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"rating_quality" integer,
	"rating_punctuality" integer,
	"rating_care" integer,
	"rating_value" integer,
	"comment" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'published' NOT NULL,
	"hidden_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_rating_quality_range" CHECK ("reviews"."rating_quality" is null or ("reviews"."rating_quality" between 1 and 5)),
	CONSTRAINT "reviews_rating_punctuality_range" CHECK ("reviews"."rating_punctuality" is null or ("reviews"."rating_punctuality" between 1 and 5)),
	CONSTRAINT "reviews_rating_care_range" CHECK ("reviews"."rating_care" is null or ("reviews"."rating_care" between 1 and 5)),
	CONSTRAINT "reviews_rating_value_range" CHECK ("reviews"."rating_value" is null or ("reviews"."rating_value" between 1 and 5))
);
--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "gallery_images" jsonb;--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "house_rating_stats" ADD CONSTRAINT "house_rating_stats_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "review_replies_review_id_unique" ON "review_replies" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_replies_house_idx" ON "review_replies" USING btree ("house_id");--> statement-breakpoint
CREATE INDEX "review_reports_review_idx" ON "review_reports" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reports_status_idx" ON "review_reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_order_id_unique" ON "reviews" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "reviews_house_status_idx" ON "reviews" USING btree ("house_id","status");--> statement-breakpoint
CREATE INDEX "reviews_customer_idx" ON "reviews" USING btree ("customer_id");