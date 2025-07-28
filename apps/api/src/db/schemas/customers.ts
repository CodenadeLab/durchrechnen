// =============================================================================
// CUSTOMERS SCHEMA MODULE - Customer Management with Segmentation & Contacts
// =============================================================================

import {
  boolean,
  json,
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

export const customerSegmentEnum = pgEnum("customer_segment", [
  "private", // Privatkunden
  "sme", // Small & Medium Enterprises (KMU)
  "enterprise", // Großunternehmen
]);

export const contactRoleEnum = pgEnum("contact_role", [
  "primary",
  "technical",
  "billing",
  "decision_maker",
  "other",
]);

// =============================================================================
// CUSTOMERS TABLE
// =============================================================================

export const customers = pgTable("customers", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // Basic Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),

  // Address Information
  address: json("address").$type<{
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }>(),

  // Company Information (for business customers)
  companyName: text("company_name"),
  taxId: text("tax_id"), // Steuernummer/USt-IdNr
  commercialRegister: text("commercial_register"), // Handelsregister

  // Customer Segmentation
  segment: customerSegmentEnum("segment").notNull().default("private"),

  // Individual Pricing Configuration
  customPricingRules: json("custom_pricing_rules")
    .$type<{
      discountPercentage?: number;
      fixedDiscount?: number;
      specialRules?: Record<string, any>;
    }>()
    .default({}),

  // Customer Status
  isActive: boolean("is_active").notNull().default(true),
  isVip: boolean("is_vip").notNull().default(false),

  // Metadata
  notes: text("notes"),
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
// CUSTOMER CONTACTS TABLE (Multiple contacts per customer)
// =============================================================================

export const customerContacts = pgTable("customer_contacts", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),

  // Contact Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: contactRoleEnum("role").notNull().default("other"),

  // Contact Status
  isPrimary: boolean("is_primary").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),

  // Additional Information
  department: text("department"),
  notes: text("notes"),

  // Audit fields
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// =============================================================================
// CUSTOMER HISTORY TABLE (Audit Trail)
// =============================================================================

export const customerHistory = pgTable("customer_history", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),

  // Action Information
  action: text("action").notNull(), // "created", "updated", "deleted", "quotation_sent", etc.
  description: text("description"),

  // Change Details
  oldValues: json("old_values").$type<Record<string, any>>(),
  newValues: json("new_values").$type<Record<string, any>>(),

  // Context
  entityType: text("entity_type"), // "customer", "contact", "quotation", etc.
  entityId: uuid("entity_id"),

  // Audit fields
  performedAt: timestamp("performed_at")
    .$defaultFn(() => new Date())
    .notNull(),
  performedBy: text("performed_by").references(() => user.id),
});

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

// Address Schema
export const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("Deutschland"),
  })
  .optional();

// Custom Pricing Rules Schema
export const customPricingRulesSchema = z
  .object({
    discountPercentage: z.number().min(0).max(100).optional(),
    fixedDiscount: z.number().min(0).optional(),
    specialRules: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
  })
  .default({});

// Customer Schemas with enhanced validation
export const insertCustomerSchema = createInsertSchema(customers, {
  name: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name must not exceed 100 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .max(254, "Email too long")
    .transform((email) => email.toLowerCase()),
  phone: z
    .string()
    .regex(
      /^(\+49|0049|0)?[1-9][0-9\s\-().]{6,20}$/,
      "Invalid phone number format",
    )
    .optional(),
  segment: z.enum(["private", "sme", "enterprise"]),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .optional(),
  taxId: z
    .string()
    .regex(/^DE[0-9]{9}$/, "Tax ID must be in German format (DE + 9 digits)")
    .optional(),
  address: addressSchema,
  customPricingRules: customPricingRulesSchema,
  tags: z.array(z.string()).default([]),
});

export const selectCustomerSchema = createSelectSchema(customers);
export const updateCustomerSchema = insertCustomerSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Customer Contact Schemas with enhanced validation
export const insertCustomerContactSchema = createInsertSchema(
  customerContacts,
  {
    customerId: z.string().uuid(),
    name: z
      .string()
      .min(2, "Contact name must be at least 2 characters")
      .max(100, "Contact name must not exceed 100 characters"),
    email: z
      .string()
      .email("Invalid email format")
      .max(254, "Email too long")
      .transform((email) => email.toLowerCase()),
    phone: z
      .string()
      .regex(
        /^(\+49|0049|0)?[1-9][0-9\s\-().]{6,20}$/,
        "Invalid phone number format",
      )
      .optional(),
    role: z.enum([
      "primary",
      "technical",
      "billing",
      "decision_maker",
      "other",
    ]),
    department: z.string().max(100, "Department name too long").optional(),
  },
);

export const selectCustomerContactSchema = createSelectSchema(customerContacts);
export const updateCustomerContactSchema = insertCustomerContactSchema
  .partial()
  .omit({
    id: true,
    createdAt: true,
  });

// Customer History Schemas
export const insertCustomerHistorySchema = createInsertSchema(customerHistory, {
  customerId: z.string().uuid(),
  action: z.string().min(1, "Action must be specified"),
  description: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export type CustomerContact = typeof customerContacts.$inferSelect;
export type NewCustomerContact = typeof customerContacts.$inferInsert;
export type UpdateCustomerContact = z.infer<typeof updateCustomerContactSchema>;

export type CustomerHistory = typeof customerHistory.$inferSelect;
export type NewCustomerHistory = typeof customerHistory.$inferInsert;

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type CustomerAddress = {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export type CustomPricingRules = {
  discountPercentage?: number;
  fixedDiscount?: number;
  specialRules?: Record<string, any>;
};

export type CustomerSegment = "private" | "sme" | "enterprise";
export type ContactRole =
  | "primary"
  | "technical"
  | "billing"
  | "decision_maker"
  | "other";
