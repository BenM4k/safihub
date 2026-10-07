CREATE TYPE "public"."currency" AS ENUM('CDF', 'USD');--> statement-breakpoint
CREATE TYPE "public"."consent_document" AS ENUM('terms', 'privacy', 'photos');--> statement-breakpoint
CREATE TYPE "public"."item_request_kind" AS ENUM('item', 'fabric');--> statement-breakpoint
CREATE TYPE "public"."item_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."neighborhood_status" AS ENUM('served', 'paused', 'not_served');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('unassigned', 'assigned', 'accepted', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."mission_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('cash_collected', 'cash_remitted', 'owed_to_house', 'owed_to_owner', 'courier_pay', 'deposit_held', 'deposit_released', 'float_issued', 'float_returned', 'house_settlement_paid', 'courier_pay_paid', 'discrepancy', 'reversal');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'push', 'sms', 'whatsapp_link');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."photo_type" AS ENUM('pickup_condition', 'delivery_proof', 'dispute');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('open', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."approval_method" AS ENUM('app', 'tracking_link', 'on_the_spot', 'phone');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."dispute_type" AS ENUM('loss', 'damage', 'payment', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_event_type" AS ENUM('status_change', 'price_adjustment', 'approval', 'assignment', 'payment', 'note');--> statement-breakpoint
CREATE TYPE "public"."order_item_status" AS ENUM('accepted', 'returned');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('app', 'whatsapp', 'phone');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('awaiting_confirmation', 'created', 'accepted', 'pickup_assigned', 'pickup_in_progress', 'picked_up', 'received', 'price_adjusted', 'washing', 'ready', 'delivery_slot_confirmed', 'delivery_assigned', 'delivery_in_progress', 'delivered', 'rejected', 'expired', 'cancelled', 'pickup_failed', 'price_declined', 'delivery_failed', 'disputed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"document" "consent_document" NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"label" text,
	"neighborhood_id" uuid NOT NULL,
	"landmark" text NOT NULL,
	"phone" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'customer',
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"is_guest" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"contact_phone" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fabrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_fr" text NOT NULL,
	"name_sw" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"requested_by" text NOT NULL,
	"kind" "item_request_kind" NOT NULL,
	"name" text NOT NULL,
	"note" text,
	"status" "item_request_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_item_id" uuid,
	"created_fabric_id" uuid,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_fr" text NOT NULL,
	"name_sw" text NOT NULL,
	"category" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_sw" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "courier_zones" (
	"courier_id" text NOT NULL,
	"zone_id" uuid NOT NULL,
	CONSTRAINT "courier_zones_courier_id_zone_id_pk" PRIMARY KEY("courier_id","zone_id")
);
--> statement-breakpoint
CREATE TABLE "coverage_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"neighborhood_id" uuid,
	"neighborhood_text" text,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notified_at" timestamp with time zone,
	CONSTRAINT "coverage_requests_place_given" CHECK ("coverage_requests"."neighborhood_id" is not null or "coverage_requests"."neighborhood_text" is not null)
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"zone_id" uuid NOT NULL,
	"status" "neighborhood_status" DEFAULT 'not_served' NOT NULL,
	"pause_reason" text,
	"paused_until" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "neighborhoods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "zone_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_zone_id" uuid NOT NULL,
	"house_zone_id" uuid NOT NULL,
	"delivery_fee" integer NOT NULL,
	"currency" "currency" DEFAULT 'CDF' NOT NULL,
	"distance_level" smallint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "zone_fees_fee_non_negative" CHECK ("zone_fees"."delivery_fee" >= 0),
	CONSTRAINT "zone_fees_level_positive" CHECK ("zone_fees"."distance_level" >= 1)
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "zones_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "house_closures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "house_closures_order" CHECK ("house_closures"."ends_on" >= "house_closures"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "house_coverage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"neighborhood_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"paused_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "house_exclusions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"item_id" uuid,
	"fabric_id" uuid,
	"note" text,
	CONSTRAINT "house_exclusions_target" CHECK ("house_exclusions"."item_id" is not null or "house_exclusions"."fabric_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "house_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"weekday" smallint NOT NULL,
	"opens_at" time NOT NULL,
	"closes_at" time NOT NULL,
	CONSTRAINT "house_hours_weekday_range" CHECK ("house_hours"."weekday" between 1 and 7),
	CONSTRAINT "house_hours_order" CHECK ("house_hours"."closes_at" > "house_hours"."opens_at")
);
--> statement-breakpoint
CREATE TABLE "house_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"house_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"fabric_id" uuid NOT NULL,
	"price" integer NOT NULL,
	"currency" "currency" DEFAULT 'CDF' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "house_items_price_non_negative" CHECK ("house_items"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "house_members" (
	"house_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "house_members_house_id_user_id_pk" PRIMARY KEY("house_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"neighborhood_id" uuid NOT NULL,
	"address_note" text,
	"contact_phone" text,
	"commission_bps" integer,
	"minimum_order_amount" integer DEFAULT 0 NOT NULL,
	"cutoff_minutes" integer DEFAULT 120 NOT NULL,
	"turnaround_hours" integer DEFAULT 48 NOT NULL,
	"daily_capacity" integer,
	"max_distance_level" smallint,
	"is_owner_house" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"paused_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "houses_commission_range" CHECK ("houses"."commission_bps" is null or ("houses"."commission_bps" between 0 and 10000)),
	CONSTRAINT "houses_min_order_non_negative" CHECK ("houses"."minimum_order_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "courier_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"cash_ceiling" integer,
	"security_deposit" integer DEFAULT 0 NOT NULL,
	"change_float" integer DEFAULT 0 NOT NULL,
	"pay_per_leg" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courier_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courier_id" text NOT NULL,
	"weekday" smallint NOT NULL,
	"starts_at" time NOT NULL,
	"ends_at" time NOT NULL,
	CONSTRAINT "courier_shifts_weekday_range" CHECK ("courier_shifts"."weekday" between 1 and 7),
	CONSTRAINT "courier_shifts_order" CHECK ("courier_shifts"."ends_at" > "courier_shifts"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "mission_type" NOT NULL,
	"courier_id" text,
	"status" "mission_status" DEFAULT 'unassigned' NOT NULL,
	"slot_start" timestamp with time zone NOT NULL,
	"slot_end" timestamp with time zone NOT NULL,
	"courier_pay" integer,
	"currency" "currency" DEFAULT 'CDF' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failure_reason" text,
	"cash_collected" integer,
	"cash_currency" "currency",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "missions_slot_order" CHECK ("missions"."slot_end" > "missions"."slot_start")
);
--> statement-breakpoint
CREATE TABLE "cash_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"order_id" uuid,
	"mission_id" uuid,
	"courier_id" text,
	"house_id" uuid,
	"currency" "currency" NOT NULL,
	"amount" integer NOT NULL,
	"reversal_of_id" uuid,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cash_ledger_reversal_link" CHECK (("cash_ledger"."entry_type" = 'reversal') = ("cash_ledger"."reversal_of_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "cash_reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courier_id" text NOT NULL,
	"business_date" date NOT NULL,
	"currency" "currency" NOT NULL,
	"expected_amount" integer NOT NULL,
	"received_amount" integer NOT NULL,
	"difference" integer NOT NULL,
	"status" "reconciliation_status" DEFAULT 'open' NOT NULL,
	"note" text,
	"reconciled_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_currency" "currency" NOT NULL,
	"quote_currency" "currency" NOT NULL,
	"rate" numeric(18, 6) NOT NULL,
	"effective_date" date NOT NULL,
	"set_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_rates_distinct_currencies" CHECK ("exchange_rates"."base_currency" <> "exchange_rates"."quote_currency"),
	CONSTRAINT "exchange_rates_positive" CHECK ("exchange_rates"."rate" > 0)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"phone" text,
	"order_id" uuid,
	"channel" "notification_channel" NOT NULL,
	"template_key" text NOT NULL,
	"locale" text DEFAULT 'fr' NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_recipient" CHECK ("notifications"."user_id" is not null or "notifications"."phone" is not null)
);
--> statement-breakpoint
CREATE TABLE "order_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"order_item_id" uuid,
	"mission_id" uuid,
	"dispute_id" uuid,
	"type" "photo_type" NOT NULL,
	"storage_key" text NOT NULL,
	"size_bytes" integer,
	"taken_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_after" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"default_commission_bps" integer DEFAULT 2000 NOT NULL,
	"acceptance_delay_minutes" integer DEFAULT 45 NOT NULL,
	"acceptance_reminder_percent" integer DEFAULT 50 NOT NULL,
	"acceptance_escalation_percent" integer DEFAULT 75 NOT NULL,
	"reception_window_minutes" integer DEFAULT 60 NOT NULL,
	"slot_length_minutes" integer DEFAULT 120 NOT NULL,
	"max_coverage_distance_level" smallint DEFAULT 2 NOT NULL,
	"default_cash_ceiling" integer,
	"default_courier_pay_per_leg" integer,
	"first_order_screening" boolean DEFAULT false NOT NULL,
	"max_open_orders_per_customer" integer DEFAULT 2 NOT NULL,
	"max_items_per_order" integer DEFAULT 50 NOT NULL,
	"max_free_text_lines" integer DEFAULT 1 NOT NULL,
	"failed_pickup_block_threshold" integer DEFAULT 2 NOT NULL,
	"photo_retention_days" integer DEFAULT 90 NOT NULL,
	"timezone" text DEFAULT 'Africa/Lubumbashi' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_single_row" CHECK ("settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"opened_by" text NOT NULL,
	"type" "dispute_type" NOT NULL,
	"description" text NOT NULL,
	"status" "dispute_status" DEFAULT 'open' NOT NULL,
	"resolution" text,
	"compensation_amount" integer,
	"currency" "currency" DEFAULT 'CDF' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "order_event_type" DEFAULT 'status_change' NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status",
	"actor_id" text,
	"actor_role" text,
	"on_behalf_of_house_id" uuid,
	"approval_method" "approval_method",
	"recorded_by" text,
	"note" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"house_item_id" uuid,
	"service_id" uuid,
	"item_id" uuid,
	"fabric_id" uuid,
	"custom_label" text,
	"declared_quantity" integer NOT NULL,
	"pickup_quantity" integer,
	"received_quantity" integer,
	"unit_price" integer DEFAULT 0 NOT NULL,
	"condition_note" text,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"status" "order_item_status" DEFAULT 'accepted' NOT NULL,
	CONSTRAINT "order_items_item_or_custom" CHECK ("order_items"."item_id" is not null or "order_items"."custom_label" is not null),
	CONSTRAINT "order_items_quantities_valid" CHECK ("order_items"."declared_quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"tracking_token" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"customer_id" text NOT NULL,
	"house_id" uuid NOT NULL,
	"source" "order_source" DEFAULT 'app' NOT NULL,
	"status" "order_status" DEFAULT 'created' NOT NULL,
	"currency" "currency" DEFAULT 'CDF' NOT NULL,
	"neighborhood_id" uuid NOT NULL,
	"landmark" text NOT NULL,
	"contact_phone" text NOT NULL,
	"pickup_slot_start" timestamp with time zone NOT NULL,
	"pickup_slot_end" timestamp with time zone NOT NULL,
	"delivery_slot_start" timestamp with time zone,
	"delivery_slot_end" timestamp with time zone,
	"estimated_delivery_at" timestamp with time zone,
	"acceptance_deadline_at" timestamp with time zone,
	"acceptance_reminder_sent_at" timestamp with time zone,
	"acceptance_escalated_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"reception_deadline_at" timestamp with time zone,
	"reception_confirmed_at" timestamp with time zone,
	"items_total" integer NOT NULL,
	"adjusted_items_total" integer,
	"delivery_fee" integer NOT NULL,
	"commission_bps" integer NOT NULL,
	"commission_amount" integer NOT NULL,
	"total_due" integer NOT NULL,
	"payment_currency" "currency" DEFAULT 'CDF' NOT NULL,
	"exchange_rate_used" numeric(18, 6),
	"delivery_confirmation_code" text,
	"failed_pickup_count" integer DEFAULT 0 NOT NULL,
	"failed_delivery_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_amounts_non_negative" CHECK ("orders"."items_total" >= 0 and "orders"."delivery_fee" >= 0 and "orders"."commission_amount" >= 0 and "orders"."total_due" >= 0),
	CONSTRAINT "orders_pickup_slot_order" CHECK ("orders"."pickup_slot_end" > "orders"."pickup_slot_start"),
	CONSTRAINT "orders_delivery_slot_order" CHECK ("orders"."delivery_slot_end" is null or "orders"."delivery_slot_start" is null or "orders"."delivery_slot_end" > "orders"."delivery_slot_start")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_requests" ADD CONSTRAINT "item_requests_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_requests" ADD CONSTRAINT "item_requests_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_requests" ADD CONSTRAINT "item_requests_created_item_id_items_id_fk" FOREIGN KEY ("created_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_requests" ADD CONSTRAINT "item_requests_created_fabric_id_fabrics_id_fk" FOREIGN KEY ("created_fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_requests" ADD CONSTRAINT "item_requests_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courier_zones" ADD CONSTRAINT "courier_zones_courier_id_user_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courier_zones" ADD CONSTRAINT "courier_zones_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_requests" ADD CONSTRAINT "coverage_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone_fees" ADD CONSTRAINT "zone_fees_customer_zone_id_zones_id_fk" FOREIGN KEY ("customer_zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone_fees" ADD CONSTRAINT "zone_fees_house_zone_id_zones_id_fk" FOREIGN KEY ("house_zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_closures" ADD CONSTRAINT "house_closures_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_coverage" ADD CONSTRAINT "house_coverage_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_coverage" ADD CONSTRAINT "house_coverage_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_exclusions" ADD CONSTRAINT "house_exclusions_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_exclusions" ADD CONSTRAINT "house_exclusions_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_exclusions" ADD CONSTRAINT "house_exclusions_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_hours" ADD CONSTRAINT "house_hours_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_items" ADD CONSTRAINT "house_items_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_items" ADD CONSTRAINT "house_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_items" ADD CONSTRAINT "house_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_items" ADD CONSTRAINT "house_items_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_members" ADD CONSTRAINT "house_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courier_profiles" ADD CONSTRAINT "courier_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courier_shifts" ADD CONSTRAINT "courier_shifts_courier_id_user_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_courier_id_user_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_courier_id_user_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_reversal_of_id_cash_ledger_id_fk" FOREIGN KEY ("reversal_of_id") REFERENCES "public"."cash_ledger"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_reconciliations" ADD CONSTRAINT "cash_reconciliations_courier_id_user_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_reconciliations" ADD CONSTRAINT "cash_reconciliations_reconciled_by_user_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_set_by_user_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_taken_by_user_id_fk" FOREIGN KEY ("taken_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_user_id_fk" FOREIGN KEY ("opened_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_on_behalf_of_house_id_houses_id_fk" FOREIGN KEY ("on_behalf_of_house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_recorded_by_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_house_item_id_house_items_id_fk" FOREIGN KEY ("house_item_id") REFERENCES "public"."house_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_fabric_id_fabrics_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "consents_unique" ON "consents" USING btree ("user_id","document","version");--> statement-breakpoint
CREATE INDEX "customer_addresses_user_idx" ON "customer_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "item_requests_status_idx" ON "item_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coverage_requests_neighborhood_idx" ON "coverage_requests" USING btree ("neighborhood_id");--> statement-breakpoint
CREATE INDEX "neighborhoods_zone_idx" ON "neighborhoods" USING btree ("zone_id");--> statement-breakpoint
CREATE INDEX "neighborhoods_status_idx" ON "neighborhoods" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "zone_fees_pair_unique" ON "zone_fees" USING btree ("customer_zone_id","house_zone_id");--> statement-breakpoint
CREATE INDEX "house_closures_house_idx" ON "house_closures" USING btree ("house_id","starts_on");--> statement-breakpoint
CREATE UNIQUE INDEX "house_coverage_unique" ON "house_coverage" USING btree ("house_id","neighborhood_id");--> statement-breakpoint
CREATE INDEX "house_coverage_neighborhood_idx" ON "house_coverage" USING btree ("neighborhood_id");--> statement-breakpoint
CREATE INDEX "house_exclusions_house_idx" ON "house_exclusions" USING btree ("house_id");--> statement-breakpoint
CREATE INDEX "house_hours_house_idx" ON "house_hours" USING btree ("house_id","weekday");--> statement-breakpoint
CREATE UNIQUE INDEX "house_items_unique" ON "house_items" USING btree ("house_id","service_id","item_id","fabric_id");--> statement-breakpoint
CREATE INDEX "house_items_house_idx" ON "house_items" USING btree ("house_id","is_active");--> statement-breakpoint
CREATE INDEX "house_members_user_idx" ON "house_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "houses_neighborhood_idx" ON "houses" USING btree ("neighborhood_id");--> statement-breakpoint
CREATE INDEX "courier_shifts_courier_idx" ON "courier_shifts" USING btree ("courier_id","weekday");--> statement-breakpoint
CREATE INDEX "missions_courier_status_idx" ON "missions" USING btree ("courier_id","status");--> statement-breakpoint
CREATE INDEX "missions_order_idx" ON "missions" USING btree ("order_id","type");--> statement-breakpoint
CREATE INDEX "missions_status_slot_idx" ON "missions" USING btree ("status","slot_start");--> statement-breakpoint
CREATE INDEX "cash_ledger_courier_idx" ON "cash_ledger" USING btree ("courier_id","created_at");--> statement-breakpoint
CREATE INDEX "cash_ledger_house_idx" ON "cash_ledger" USING btree ("house_id","created_at");--> statement-breakpoint
CREATE INDEX "cash_ledger_order_idx" ON "cash_ledger" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cash_reconciliations_unique" ON "cash_reconciliations" USING btree ("courier_id","business_date","currency");--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_rates_pair_date_unique" ON "exchange_rates" USING btree ("base_currency","quote_currency","effective_date");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "order_photos_storage_key_unique" ON "order_photos" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "order_photos_order_idx" ON "order_photos" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_photos_retention_idx" ON "order_photos" USING btree ("delete_after");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "disputes" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "disputes_order_idx" ON "disputes" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_events_order_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_code_unique" ON "orders" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_tracking_token_unique" ON "orders" USING btree ("tracking_token");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_customer_idempotency_unique" ON "orders" USING btree ("customer_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "orders_house_status_idx" ON "orders" USING btree ("house_id","status");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_deadline_idx" ON "orders" USING btree ("status","acceptance_deadline_at");--> statement-breakpoint
CREATE INDEX "orders_reception_deadline_idx" ON "orders" USING btree ("status","reception_deadline_at");