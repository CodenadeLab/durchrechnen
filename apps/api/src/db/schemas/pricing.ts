// =============================================================================
// PRICING SCHEMA MODULE - 4 Pricing Models & Calculation Rules
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
  uuid 
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { customers } from "./customers";
import { services } from "./services";

// =============================================================================
// ENUMS
// =============================================================================

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",  // Prozentual
  "fixed",       // Fester Betrag
  "bundle",      // Bundle-Rabatt
  "volume",      // Mengenrabatt
  "customer",    // Kundenspezifisch
  "seasonal"     // Saisonaler Rabatt
]);

export const calculationLogStatusEnum = pgEnum("calculation_log_status", [
  "success",
  "error", 
  "partial",
  "cached"
]);

// =============================================================================
// DISCOUNT RULES TABLE
// =============================================================================

export const discountRules = pgTable("discount_rules", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Rule Identification
  name: text("name").notNull(),
  code: text("code").unique(), // Optional discount code
  description: text("description"),
  
  // Discount Configuration
  type: discountTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(), // Percentage or fixed amount
  
  // Applicability Rules
  minAmount: numeric("min_amount", { precision: 10, scale: 2 }),
  maxAmount: numeric("max_amount", { precision: 10, scale: 2 }),
  minQuantity: integer("min_quantity"),
  maxQuantity: integer("max_quantity"),
  
  // Service/Customer Restrictions
  applicableServices: json("applicable_services").$type<string[]>().default([]), // Service IDs
  applicableCustomers: json("applicable_customers").$type<string[]>().default([]), // Customer IDs
  applicableSegments: json("applicable_segments").$type<string[]>().default([]), // Customer segments
  
  // Time Restrictions
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  
  // Usage Limitations
  maxUsageCount: integer("max_usage_count"), // How many times can be used
  currentUsageCount: integer("current_usage_count").notNull().default(0),
  maxUsagePerCustomer: integer("max_usage_per_customer"),
  
  // Rule Conditions (JSON-based rule engine)
  conditions: json("conditions").$type<{
    bundleServices?: string[]; // For bundle discounts
    requiredQuantity?: number;  // For volume discounts
    dayOfWeek?: number[];      // For time-based discounts
    customLogic?: Record<string, any>;
  }>().default({}),
  
  // Rule Priority & Status
  priority: integer("priority").notNull().default(0), // Higher number = higher priority
  isActive: boolean("is_active").notNull().default(true),
  isStackable: boolean("is_stackable").notNull().default(false), // Can combine with other discounts
  
  // Metadata
  tags: json("tags").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  
  // Audit fields
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  createdBy: text("created_by").references(() => user.id),
});

// =============================================================================
// CALCULATION LOGS TABLE (For audit and performance tracking)
// =============================================================================

export const calculationLogs = pgTable("calculation_logs", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Calculation Context
  sessionId: text("session_id"), // For grouping related calculations
  calculationType: text("calculation_type").notNull(), // "quote", "estimate", "bundle", etc.
  
  // Input Data
  inputData: json("input_data").$type<{
    services: Array<{
      serviceId: string;
      quantity: number;
      complexity?: string;
      customConfig?: Record<string, any>;
    }>;
    customerId?: string;
    discountCodes?: string[];
    metadata?: Record<string, any>;
  }>().notNull(),
  
  // Output Data
  outputData: json("output_data").$type<{
    subtotal: number;
    discounts: Array<{
      ruleId: string;
      ruleName: string;
      type: string;
      amount: number;
    }>;
    total: number;
    calculationTime: number; // in milliseconds
    cacheHit?: boolean;
  }>(),
  
  // Calculation Status
  status: calculationLogStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  
  // Performance Metrics
  executionTimeMs: integer("execution_time_ms"),
  cacheHit: boolean("cache_hit").notNull().default(false),
  
  // User Context
  userId: text("user_id").references(() => user.id),
  customerId: uuid("customer_id").references(() => customers.id),
  
  // Request Context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Audit fields
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// =============================================================================
// PRICING CACHE TABLE (For performance optimization)
// =============================================================================

export const pricingCache = pgTable("pricing_cache", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Cache Key (hash of input parameters)
  cacheKey: text("cache_key").notNull().unique(),
  
  // Cached Calculation Result
  calculationResult: json("calculation_result").$type<{
    subtotal: number;
    discounts: Array<{
      ruleId: string;
      amount: number;
    }>;
    total: number;
    appliedRules: string[];
  }>().notNull(),
  
  // Cache Metadata
  inputHash: text("input_hash").notNull(), // For validation
  serviceIds: json("service_ids").$type<string[]>().notNull(), // For cache invalidation
  customerId: uuid("customer_id").references(() => customers.id), // For customer-specific cache
  
  // Cache Lifecycle
  hitCount: integer("hit_count").notNull().default(0),
  lastAccessedAt: timestamp("last_accessed_at").$defaultFn(() => new Date()).notNull(),
  expiresAt: timestamp("expires_at").notNull(), // Auto-expire cache entries
  
  // Audit fields
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

// Discount Rules Schemas
export const insertDiscountRuleSchema = createInsertSchema(discountRules, {
  name: z.string().min(2, "Rule name must be at least 2 characters"),
  code: z.string().optional(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid value format"),
  minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
  maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
  minQuantity: z.number().int().positive().optional(),
  maxQuantity: z.number().int().positive().optional(),
  applicableServices: z.array(z.string().uuid()).default([]),
  applicableCustomers: z.array(z.string().uuid()).default([]),
  applicableSegments: z.array(z.string()).default([]),
  maxUsageCount: z.number().int().positive().optional(),
  maxUsagePerCustomer: z.number().int().positive().optional(),
  priority: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
});

export const selectDiscountRuleSchema = createSelectSchema(discountRules);
export const updateDiscountRuleSchema = insertDiscountRuleSchema.partial().omit({ 
  id: true, 
  createdAt: true,
  currentUsageCount: true // Should only be updated by system
});

// Calculation Input Schema
export const calculationInputSchema = z.object({
  services: z.array(z.object({
    serviceId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
    complexity: z.enum(["basic", "standard", "premium"]).optional(),
    customConfig: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  })).min(1, "At least one service is required"),
  customerId: z.string().uuid().optional(),
  discountCodes: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

// Calculation Output Schema
export const calculationOutputSchema = z.object({
  subtotal: z.number().min(0),
  discounts: z.array(z.object({
    ruleId: z.string().uuid(),
    ruleName: z.string(),
    type: z.string(),
    amount: z.number().min(0),
  })),
  total: z.number().min(0),
  calculationTime: z.number().min(0),
  cacheHit: z.boolean().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type DiscountRule = typeof discountRules.$inferSelect;
export type NewDiscountRule = typeof discountRules.$inferInsert;
export type UpdateDiscountRule = z.infer<typeof updateDiscountRuleSchema>;

export type CalculationLog = typeof calculationLogs.$inferSelect;
export type NewCalculationLog = typeof calculationLogs.$inferInsert;

export type PricingCache = typeof pricingCache.$inferSelect;
export type NewPricingCache = typeof pricingCache.$inferInsert;

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DiscountType = "percentage" | "fixed" | "bundle" | "volume" | "customer" | "seasonal";
export type CalculationStatus = "success" | "error" | "partial" | "cached";

export type CalculationInput = z.infer<typeof calculationInputSchema>;
export type CalculationOutput = z.infer<typeof calculationOutputSchema>;

export type ServiceCalculationItem = {
  serviceId: string;
  quantity: number;
  complexity?: "basic" | "standard" | "premium";
  customConfig?: Record<string, any>;
};

export type AppliedDiscount = {
  ruleId: string;
  ruleName: string;
  type: string;
  amount: number;
};

// Default cache expiration (1 hour)
export const DEFAULT_CACHE_EXPIRATION_HOURS = 1;