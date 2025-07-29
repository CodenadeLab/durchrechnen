CREATE TYPE "public"."complexity_level" AS ENUM('basic', 'standard', 'premium');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('fixed', 'hourly', 'monthly', 'project');--> statement-breakpoint
CREATE TYPE "public"."contact_role" AS ENUM('primary', 'technical', 'billing', 'decision_maker', 'other');--> statement-breakpoint
CREATE TYPE "public"."customer_segment" AS ENUM('private', 'sme', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."quotation_action" AS ENUM('created', 'updated', 'sent', 'accepted', 'rejected', 'expired', 'cancelled', 'duplicated', 'pdf_generated');--> statement-breakpoint
CREATE TYPE "public"."quotation_status" AS ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."calculation_log_status" AS ENUM('success', 'error', 'partial', 'cached');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed', 'bundle', 'volume', 'customer', 'seasonal');--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"service_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"conditions" json NOT NULL,
	"actions" json NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_dependencies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"service_id" uuid NOT NULL,
	"dependent_service_id" uuid NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"reason" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"category_id" uuid NOT NULL,
	"pricing_model" "pricing_model" NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"min_hours" integer,
	"max_hours" integer,
	"complexity_multiplier" json DEFAULT '{"basic":1,"standard":1.5,"premium":2}'::json,
	"dependencies" json DEFAULT '[]'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "contact_role" DEFAULT 'other' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"department" text,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_id" uuid NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"old_values" json,
	"new_values" json,
	"entity_type" text,
	"entity_id" uuid,
	"performed_at" timestamp NOT NULL,
	"performed_by" text
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" json,
	"company_name" text,
	"tax_id" text,
	"commercial_register" text,
	"segment" "customer_segment" DEFAULT 'private' NOT NULL,
	"custom_pricing_rules" json DEFAULT '{}'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_vip" boolean DEFAULT false NOT NULL,
	"notes" text,
	"tags" json DEFAULT '[]'::json,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "quotation_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quotation_id" uuid NOT NULL,
	"action" "quotation_action" NOT NULL,
	"description" text,
	"old_values" json,
	"new_values" json,
	"ip_address" text,
	"user_agent" text,
	"performed_at" timestamp NOT NULL,
	"performed_by" text
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quotation_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"final_price" numeric(10, 2) NOT NULL,
	"complexity" text,
	"custom_configuration" json DEFAULT '{}'::json,
	"position" integer DEFAULT 0 NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quote_number" text NOT NULL,
	"title" text,
	"customer_id" uuid NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"status" "quotation_status" DEFAULT 'draft' NOT NULL,
	"subtotal_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_quote_id" uuid,
	"notes" text,
	"customer_notes" text,
	"terms_conditions" text,
	"template_id" text,
	"pdf_generated" boolean DEFAULT false NOT NULL,
	"pdf_url" text,
	"tags" json DEFAULT '[]'::json,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text,
	CONSTRAINT "quotations_quote_number_unique" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "calculation_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" text,
	"calculation_type" text NOT NULL,
	"input_data" json NOT NULL,
	"output_data" json,
	"status" "calculation_log_status" NOT NULL,
	"error_message" text,
	"execution_time_ms" integer,
	"cache_hit" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"customer_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_rules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text,
	"type" "discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_amount" numeric(10, 2),
	"max_amount" numeric(10, 2),
	"min_quantity" integer,
	"max_quantity" integer,
	"applicable_services" json DEFAULT '[]'::json,
	"applicable_customers" json DEFAULT '[]'::json,
	"applicable_segments" json DEFAULT '[]'::json,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"max_usage_count" integer,
	"current_usage_count" integer DEFAULT 0 NOT NULL,
	"max_usage_per_customer" integer,
	"conditions" json DEFAULT '{}'::json,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_stackable" boolean DEFAULT false NOT NULL,
	"tags" json DEFAULT '[]'::json,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"created_by" text,
	CONSTRAINT "discount_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "pricing_cache" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cache_key" text NOT NULL,
	"calculation_result" json NOT NULL,
	"input_hash" text NOT NULL,
	"service_ids" json NOT NULL,
	"customer_id" uuid,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "pricing_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_dependencies" ADD CONSTRAINT "service_dependencies_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_dependencies" ADD CONSTRAINT "service_dependencies_dependent_service_id_services_id_fk" FOREIGN KEY ("dependent_service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_history" ADD CONSTRAINT "customer_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_history" ADD CONSTRAINT "customer_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_history" ADD CONSTRAINT "quotation_history_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_history" ADD CONSTRAINT "quotation_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_parent_quote_id_quotations_id_fk" FOREIGN KEY ("parent_quote_id") REFERENCES "public"."quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_logs" ADD CONSTRAINT "calculation_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calculation_logs" ADD CONSTRAINT "calculation_logs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_cache" ADD CONSTRAINT "pricing_cache_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;