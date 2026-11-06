CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD COLUMN "centroid" geometry(point, 4326);--> statement-breakpoint
ALTER TABLE "house_applications" ADD COLUMN "location" geometry(point, 4326);--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "location" geometry(point, 4326);--> statement-breakpoint
ALTER TABLE "houses" ADD COLUMN "location_updated_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "neighborhoods_centroid_gist_idx" ON "neighborhoods" USING gist ("centroid");--> statement-breakpoint
CREATE INDEX "houses_location_gist_idx" ON "houses" USING gist ("location");--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_centroid_bukavu_bbox" CHECK ("neighborhoods"."centroid" is null or ST_Covers(ST_MakeEnvelope(28.75, -2.60, 28.95, -2.40, 4326), "neighborhoods"."centroid"));--> statement-breakpoint
ALTER TABLE "house_applications" ADD CONSTRAINT "house_applications_location_bukavu_bbox" CHECK ("house_applications"."location" is null or ST_Covers(ST_MakeEnvelope(28.75, -2.60, 28.95, -2.40, 4326), "house_applications"."location"));--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_location_bukavu_bbox" CHECK ("houses"."location" is null or ST_Covers(ST_MakeEnvelope(28.75, -2.60, 28.95, -2.40, 4326), "houses"."location"));--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.864, -2.502), 4326) WHERE "name" = 'La Botte' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.871, -2.528), 4326) WHERE "name" = 'Nguba' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.868, -2.515), 4326) WHERE "name" = 'Muhumba' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.859, -2.508), 4326) WHERE "name" = 'Nyarwizimya' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.865, -2.545), 4326) WHERE "name" = 'Panzi' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.845, -2.501), 4326) WHERE "name" = 'Kadutu Centre' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.848, -2.493), 4326) WHERE "name" = 'Nyamugo' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.838, -2.507), 4326) WHERE "name" = 'Cimpunda' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.825, -2.478), 4326) WHERE "name" = 'Bagira Centre' AND "centroid" IS NULL;--> statement-breakpoint
UPDATE "neighborhoods" SET "centroid" = ST_SetSRID(ST_MakePoint(28.831, -2.483), 4326) WHERE "name" = 'Lumumba' AND "centroid" IS NULL;