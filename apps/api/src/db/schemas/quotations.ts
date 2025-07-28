// =============================================================================
// QUOTATIONS SCHEMA MODULE - Quote Management with Versioning & Status
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

export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",      // Entwurf
  "sent",       // Versendet
  "accepted",   // Angenommen
  "rejected",   // Abgelehnt
  "expired",    // Abgelaufen
  "cancelled"   // Storniert
]);

export const quotationActionEnum = pgEnum("quotation_action", [
  "created",
  "updated", 
  "sent",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
  "duplicated",
  "pdf_generated"
]);

// =============================================================================
// QUOTATIONS TABLE
// =============================================================================

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // Quote Identification
  quoteNumber: text("quote_number").notNull().unique(), // e.g., "Q-2024-001"
  title: text("title"), // Optional quote title
  
  // Customer Relation
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
    
  // Validity Period
  validFrom: timestamp("valid_from").$defaultFn(() => new Date()).notNull(),
  validUntil: timestamp("valid_until").notNull(), // Must be set
  
  // Status Management
  status: quotationStatusEnum("status").notNull().default("draft"),
  
  // Pricing Information
  subtotalAmount: numeric("subtotal_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // Versioning (for quote revisions)
  version: integer("version").notNull().default(1),
  parentQuoteId: uuid("parent_quote_id"), // For revisions - reference added in schema.ts
  
  // Additional Information
  notes: text("notes"), // Internal notes
  customerNotes: text("customer_notes"), // Notes visible to customer
  termsConditions: text("terms_conditions"), // Specific T&C for this quote
  
  // PDF Configuration
  templateId: text("template_id"), // Which PDF template to use
  pdfGenerated: boolean("pdf_generated").notNull().default(false),
  pdfUrl: text("pdf_url"), // URL to generated PDF
  
  // Metadata
  tags: json("tags").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  
  // Audit fields
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  createdBy: text("created_by").references(() => user.id),
});

// =============================================================================
// QUOTATION ITEMS TABLE (Service positions in quote)
// =============================================================================

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
    
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
    
  // Item Details
  name: text("name").notNull(), // Service name at time of quote (for history)
  description: text("description"),
  
  // Quantity & Pricing
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  
  // Discounts
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
  
  // Item Configuration
  complexity: text("complexity"), // "basic", "standard", "premium"
  customConfiguration: json("custom_configuration").$type<Record<string, any>>().default({}),
  
  // Position & Status
  position: integer("position").notNull().default(0), // Order in quote
  isOptional: boolean("is_optional").notNull().default(false),
  notes: text("notes"),
  
  // Audit fields
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

// =============================================================================
// QUOTATION HISTORY TABLE (Audit Trail)
// =============================================================================

export const quotationHistory = pgTable("quotation_history", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
    
  // Action Information
  action: quotationActionEnum("action").notNull(),
  description: text("description"),
  
  // Change Details
  oldValues: json("old_values").$type<Record<string, any>>(),
  newValues: json("new_values").$type<Record<string, any>>(),
  
  // Context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Audit fields
  performedAt: timestamp("performed_at").$defaultFn(() => new Date()).notNull(),
  performedBy: text("performed_by").references(() => user.id),
});

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

// Quotation Schemas
export const insertQuotationSchema = createInsertSchema(quotations, {
  quoteNumber: z.string().min(1, "Quote number is required"),
  customerId: z.string().uuid("Invalid customer ID"),
  validUntil: z.date().min(new Date(), "Valid until date must be in the future"),
  subtotalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  taxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  version: z.number().int().positive().default(1),
  tags: z.array(z.string()).default([]),
});

export const selectQuotationSchema = createSelectSchema(quotations);
export const updateQuotationSchema = insertQuotationSchema.partial().omit({ 
  id: true, 
  createdAt: true,
  quoteNumber: true // Quote number should not be updatable
});

// Quotation Item Schemas
export const insertQuotationItemSchema = createInsertSchema(quotationItems, {
  quotationId: z.string().uuid("Invalid quotation ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  totalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  finalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  position: z.number().int().min(0).default(0),
});

export const selectQuotationItemSchema = createSelectSchema(quotationItems);
export const updateQuotationItemSchema = insertQuotationItemSchema.partial().omit({ 
  id: true, 
  createdAt: true 
});

// Quotation History Schemas
export const insertQuotationHistorySchema = createInsertSchema(quotationHistory, {
  quotationId: z.string().uuid("Invalid quotation ID"),
  description: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Quotation = typeof quotations.$inferSelect;
export type NewQuotation = typeof quotations.$inferInsert;
export type UpdateQuotation = z.infer<typeof updateQuotationSchema>;

export type QuotationItem = typeof quotationItems.$inferSelect;
export type NewQuotationItem = typeof quotationItems.$inferInsert;
export type UpdateQuotationItem = z.infer<typeof updateQuotationItemSchema>;

export type QuotationHistory = typeof quotationHistory.$inferSelect;
export type NewQuotationHistory = typeof quotationHistory.$inferInsert;

// =============================================================================
// UTILITY TYPES & CONSTANTS
// =============================================================================

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "cancelled";
export type QuotationAction = "created" | "updated" | "sent" | "accepted" | "rejected" | "expired" | "cancelled" | "duplicated" | "pdf_generated";

// Quote Number Generation Helper Type
export type QuoteNumberFormat = {
  prefix: string;
  year: number;
  sequence: number;
};

// Default validity period (30 days)
export const DEFAULT_QUOTE_VALIDITY_DAYS = 30;