import {
  boolean,
  foreignKey,
  integer,
  json,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const auditAction = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "VIEW",
  "EXPORT",
  "CALCULATE",
]);
export const calculationLogStatus = pgEnum("calculation_log_status", [
  "success",
  "error",
  "partial",
  "cached",
]);
export const complexityLevel = pgEnum("complexity_level", [
  "basic",
  "standard",
  "premium",
]);
export const contactRole = pgEnum("contact_role", [
  "primary",
  "technical",
  "billing",
  "decision_maker",
  "other",
]);
export const customerSegment = pgEnum("customer_segment", [
  "private",
  "sme",
  "enterprise",
]);
export const discountType = pgEnum("discount_type", [
  "percentage",
  "fixed",
  "bundle",
  "volume",
  "customer",
  "seasonal",
]);
export const pricingModel = pgEnum("pricing_model", [
  "fixed",
  "hourly",
  "monthly",
  "project",
]);
export const quotationAction = pgEnum("quotation_action", [
  "created",
  "updated",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
  "duplicated",
  "pdf_generated",
]);
export const quotationStatus = pgEnum("quotation_status", [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
]);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    role: text().default("sales_employee"),
    isActive: boolean("is_active").default(true),
  },
  (table) => [unique("user_email_unique").on(table.email)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text().primaryKey().notNull(),
    tableName: text("table_name").notNull(),
    recordId: text("record_id").notNull(),
    action: auditAction().notNull(),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    userId: text("user_id"),
    userEmail: text("user_email"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    sessionId: text("session_id"),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
    module: text(),
    context: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "audit_logs_user_id_user_id_fk",
    }),
  ],
);

export const serviceDependencies = pgTable(
  "service_dependencies",
  {
    id: uuid().primaryKey().notNull(),
    serviceId: uuid("service_id").notNull(),
    dependentServiceId: uuid("dependent_service_id").notNull(),
    isRequired: boolean("is_required").default(true).notNull(),
    reason: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [services.id],
      name: "service_dependencies_service_id_services_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.dependentServiceId],
      foreignColumns: [services.id],
      name: "service_dependencies_dependent_service_id_services_id_fk",
    }).onDelete("cascade"),
  ],
);

export const serviceCategories = pgTable(
  "service_categories",
  {
    id: uuid().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [unique("service_categories_slug_unique").on(table.slug)],
);

export const services = pgTable(
  "services",
  {
    id: uuid().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    shortDescription: text("short_description"),
    categoryId: uuid("category_id").notNull(),
    pricingModel: pricingModel("pricing_model").notNull(),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    minHours: integer("min_hours"),
    maxHours: integer("max_hours"),
    complexityMultiplier: json("complexity_multiplier").default({
      basic: 1,
      standard: 1.5,
      premium: 2,
    }),
    dependencies: json().default([]),
    isActive: boolean("is_active").default(true).notNull(),
    isPopular: boolean("is_popular").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    tags: json().default([]),
    metadata: json().default({}),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [serviceCategories.id],
      name: "services_category_id_service_categories_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "services_created_by_user_id_fk",
    }),
    unique("services_slug_unique").on(table.slug),
  ],
);

export const quotationHistory = pgTable(
  "quotation_history",
  {
    id: uuid().primaryKey().notNull(),
    quotationId: uuid("quotation_id").notNull(),
    action: quotationAction().notNull(),
    description: text(),
    oldValues: json("old_values"),
    newValues: json("new_values"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    performedAt: timestamp("performed_at", { mode: "string" }).notNull(),
    performedBy: text("performed_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.quotationId],
      foreignColumns: [quotations.id],
      name: "quotation_history_quotation_id_quotations_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.performedBy],
      foreignColumns: [user.id],
      name: "quotation_history_performed_by_user_id_fk",
    }),
  ],
);

export const customerHistory = pgTable(
  "customer_history",
  {
    id: uuid().primaryKey().notNull(),
    customerId: uuid("customer_id").notNull(),
    action: text().notNull(),
    description: text(),
    oldValues: json("old_values"),
    newValues: json("new_values"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    performedAt: timestamp("performed_at", { mode: "string" }).notNull(),
    performedBy: text("performed_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "customer_history_customer_id_customers_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.performedBy],
      foreignColumns: [user.id],
      name: "customer_history_performed_by_user_id_fk",
    }),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    address: json(),
    companyName: text("company_name"),
    taxId: text("tax_id"),
    commercialRegister: text("commercial_register"),
    segment: customerSegment().default("private").notNull(),
    customPricingRules: json("custom_pricing_rules").default({}),
    isActive: boolean("is_active").default(true).notNull(),
    isVip: boolean("is_vip").default(false).notNull(),
    notes: text(),
    tags: json().default([]),
    metadata: json().default({}),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "customers_created_by_user_id_fk",
    }),
  ],
);

export const quotationItems = pgTable(
  "quotation_items",
  {
    id: uuid().primaryKey().notNull(),
    quotationId: uuid("quotation_id").notNull(),
    serviceId: uuid("service_id").notNull(),
    name: text().notNull(),
    description: text(),
    quantity: integer().default(1).notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    discountPercentage: numeric("discount_percentage", {
      precision: 5,
      scale: 2,
    }).default("0.00"),
    discountAmount: numeric("discount_amount", {
      precision: 10,
      scale: 2,
    }).default("0.00"),
    finalPrice: numeric("final_price", { precision: 10, scale: 2 }).notNull(),
    complexity: text(),
    customConfiguration: json("custom_configuration").default({}),
    position: integer().default(0).notNull(),
    isOptional: boolean("is_optional").default(false).notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.quotationId],
      foreignColumns: [quotations.id],
      name: "quotation_items_quotation_id_quotations_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [services.id],
      name: "quotation_items_service_id_services_id_fk",
    }).onDelete("cascade"),
  ],
);

export const pricingRules = pgTable(
  "pricing_rules",
  {
    id: uuid().primaryKey().notNull(),
    serviceId: uuid("service_id").notNull(),
    name: text().notNull(),
    description: text(),
    conditions: json().notNull(),
    actions: json().notNull(),
    priority: integer().default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [services.id],
      name: "pricing_rules_service_id_services_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "pricing_rules_created_by_user_id_fk",
    }),
  ],
);

export const customerContacts = pgTable(
  "customer_contacts",
  {
    id: uuid().primaryKey().notNull(),
    customerId: uuid("customer_id").notNull(),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    role: contactRole().default("other").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    department: text(),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "customer_contacts_customer_id_customers_id_fk",
    }).onDelete("cascade"),
  ],
);

export const quotations = pgTable(
  "quotations",
  {
    id: uuid().primaryKey().notNull(),
    quoteNumber: text("quote_number").notNull(),
    title: text(),
    customerId: uuid("customer_id").notNull(),
    validFrom: timestamp("valid_from", { mode: "string" }).notNull(),
    validUntil: timestamp("valid_until", { mode: "string" }).notNull(),
    status: quotationStatus().default("draft").notNull(),
    subtotalAmount: numeric("subtotal_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    version: integer().default(1).notNull(),
    parentQuoteId: uuid("parent_quote_id"),
    notes: text(),
    customerNotes: text("customer_notes"),
    termsConditions: text("terms_conditions"),
    templateId: text("template_id"),
    pdfGenerated: boolean("pdf_generated").default(false).notNull(),
    pdfUrl: text("pdf_url"),
    tags: json().default([]),
    metadata: json().default({}),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "quotations_customer_id_customers_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "quotations_created_by_user_id_fk",
    }),
    unique("quotations_quote_number_unique").on(table.quoteNumber),
  ],
);

export const calculationLogs = pgTable(
  "calculation_logs",
  {
    id: uuid().primaryKey().notNull(),
    sessionId: text("session_id"),
    calculationType: text("calculation_type").notNull(),
    inputData: json("input_data").notNull(),
    outputData: json("output_data"),
    status: calculationLogStatus().notNull(),
    errorMessage: text("error_message"),
    executionTimeMs: integer("execution_time_ms"),
    cacheHit: boolean("cache_hit").default(false).notNull(),
    userId: text("user_id"),
    customerId: uuid("customer_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "calculation_logs_user_id_user_id_fk",
    }),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "calculation_logs_customer_id_customers_id_fk",
    }),
  ],
);

export const discountRules = pgTable(
  "discount_rules",
  {
    id: uuid().primaryKey().notNull(),
    name: text().notNull(),
    code: text(),
    description: text(),
    type: discountType().notNull(),
    value: numeric({ precision: 10, scale: 2 }).notNull(),
    minAmount: numeric("min_amount", { precision: 10, scale: 2 }),
    maxAmount: numeric("max_amount", { precision: 10, scale: 2 }),
    minQuantity: integer("min_quantity"),
    maxQuantity: integer("max_quantity"),
    applicableServices: json("applicable_services").default([]),
    applicableCustomers: json("applicable_customers").default([]),
    applicableSegments: json("applicable_segments").default([]),
    validFrom: timestamp("valid_from", { mode: "string" }),
    validUntil: timestamp("valid_until", { mode: "string" }),
    maxUsageCount: integer("max_usage_count"),
    currentUsageCount: integer("current_usage_count").default(0).notNull(),
    maxUsagePerCustomer: integer("max_usage_per_customer"),
    conditions: json().default({}),
    priority: integer().default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isStackable: boolean("is_stackable").default(false).notNull(),
    tags: json().default([]),
    metadata: json().default({}),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    createdBy: text("created_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "discount_rules_created_by_user_id_fk",
    }),
    unique("discount_rules_code_unique").on(table.code),
  ],
);

export const pricingCache = pgTable(
  "pricing_cache",
  {
    id: uuid().primaryKey().notNull(),
    cacheKey: text("cache_key").notNull(),
    calculationResult: json("calculation_result").notNull(),
    inputHash: text("input_hash").notNull(),
    serviceIds: json("service_ids").notNull(),
    customerId: uuid("customer_id"),
    hitCount: integer("hit_count").default(0).notNull(),
    lastAccessedAt: timestamp("last_accessed_at", { mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "pricing_cache_customer_id_customers_id_fk",
    }),
    unique("pricing_cache_cache_key_unique").on(table.cacheKey),
  ],
);
