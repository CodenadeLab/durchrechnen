// =============================================================================
// SERVICES SCHEMA MODULE - 7 Service Categories with Hierarchical Structure
// =============================================================================

import {
  boolean,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";

// =============================================================================
// ENUMS
// =============================================================================

export const pricingModelEnum = pgEnum("pricing_model", [
  "fixed",
  "hourly",
  "monthly",
  "project",
]);

export const complexityLevelEnum = pgEnum("complexity_level", [
  "basic",
  "standard",
  "premium",
]);

// =============================================================================
// SERVICE CATEGORIES TABLE
// =============================================================================

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// =============================================================================
// SERVICES TABLE
// =============================================================================

export const services = pgTable("services", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Basic Info
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),

  // Category Relation
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id, { onDelete: "cascade" }),

  // Pricing Configuration
  pricingModel: pricingModelEnum("pricing_model").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),

  // Hourly/Project specific fields
  minHours: integer("min_hours"),
  maxHours: integer("max_hours"),

  // Complexity multipliers
  complexityMultiplier: json("complexity_multiplier")
    .$type<{
      basic: number;
      standard: number;
      premium: number;
    }>()
    .default({ basic: 1.0, standard: 1.5, premium: 2.0 }),

  // Service Dependencies (JSON array of service IDs)
  dependencies: json("dependencies").$type<string[]>().default([]),

  // Service Configuration
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),

  // Metadata
  tags: json("tags").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, any>>().default({}),

  // Audit fields
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  createdBy: text("created_by").references(() => user.id),
});

// =============================================================================
// SERVICE DEPENDENCIES TABLE (Many-to-Many)
// =============================================================================

export const serviceDependencies = pgTable("service_dependencies", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  dependentServiceId: uuid("dependent_service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  isRequired: boolean("is_required").notNull().default(true),
  reason: text("reason"), // Why this dependency exists

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// =============================================================================
// PRICING RULES TABLE (For complex pricing logic)
// =============================================================================

export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),

  // Rule Configuration
  name: text("name").notNull(),
  description: text("description"),

  // Rule Logic (JSON-based rule engine)
  conditions: json("conditions").$type<Record<string, any>>().notNull(),
  actions: json("actions").$type<Record<string, any>>().notNull(),

  // Rule Metadata
  priority: integer("priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),

  // Audit fields
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  createdBy: text("created_by").references(() => user.id),
});

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

// Service Category Schemas
export const insertServiceCategorySchema = createInsertSchema(
  serviceCategories,
  {
    name: z.string().min(2, "Category name must be at least 2 characters"),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    sortOrder: z.number().int().min(0),
  },
);

export const selectServiceCategorySchema =
  createSelectSchema(serviceCategories);
export const updateServiceCategorySchema = insertServiceCategorySchema
  .partial()
  .omit({
    id: true,
    createdAt: true,
  });

// Service Schemas
export const insertServiceSchema = createInsertSchema(services, {
  name: z.string().min(2, "Service name must be at least 2 characters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  basePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be valid decimal"),
  minHours: z.number().int().positive().optional(),
  maxHours: z.number().int().positive().optional(),
  dependencies: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
});

export const selectServiceSchema = createSelectSchema(services);
export const updateServiceSchema = insertServiceSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Service Dependencies Schemas
export const insertServiceDependencySchema = createInsertSchema(
  serviceDependencies,
  {
    serviceId: z.string().uuid(),
    dependentServiceId: z.string().uuid(),
    reason: z.string().optional(),
  },
);

// Pricing Rules Schemas
export const insertPricingRuleSchema = createInsertSchema(pricingRules, {
  name: z.string().min(2, "Rule name must be at least 2 characters"),
  conditions: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  ),
  actions: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  priority: z.number().int().min(0).default(0),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type UpdateServiceCategory = z.infer<typeof updateServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type UpdateService = z.infer<typeof updateServiceSchema>;

export type ServiceDependency = typeof serviceDependencies.$inferSelect;
export type NewServiceDependency = typeof serviceDependencies.$inferInsert;

export type PricingRule = typeof pricingRules.$inferSelect;
export type NewPricingRule = typeof pricingRules.$inferInsert;

// =============================================================================
// COMPLEXITY MULTIPLIER TYPES
// =============================================================================

export type ComplexityMultiplier = {
  basic: number;
  standard: number;
  premium: number;
};

export const complexityMultiplierSchema = z.object({
  basic: z.number().positive().default(1.0),
  standard: z.number().positive().default(1.5),
  premium: z.number().positive().default(2.0),
});
