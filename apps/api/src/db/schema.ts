// =============================================================================
// MAIN DATABASE SCHEMA - Modular Architecture
// =============================================================================

// Export all audit-related tables and types
export * from "./schemas/audit";
// Export all auth-related tables and types
export * from "./schemas/auth";
export * from "./schemas/customers";
export * from "./schemas/pricing";
export * from "./schemas/quotations";
// Export all business schema modules
export * from "./schemas/services";

// =============================================================================
// SCHEMA RELATIONS - Cross-module relationships for Drizzle queries
// =============================================================================

import { relations } from "drizzle-orm";
import { user } from "./schemas/auth";
import {
  customerContacts,
  customerHistory,
  customers,
} from "./schemas/customers";
import {
  calculationLogs,
  discountRules,
  pricingCache,
} from "./schemas/pricing";
import {
  quotationHistory,
  quotationItems,
  quotations,
} from "./schemas/quotations";
import {
  pricingRules,
  serviceCategories,
  serviceDependencies,
  services,
} from "./schemas/services";

// =============================================================================
// USER RELATIONS
// =============================================================================
export const userRelations = relations(user, ({ many }) => ({
  createdServices: many(services),
  createdPricingRules: many(pricingRules),
  createdCustomers: many(customers),
  createdQuotations: many(quotations),
  createdDiscountRules: many(discountRules),
  customerHistory: many(customerHistory),
  quotationHistory: many(quotationHistory),
  calculationLogs: many(calculationLogs),
}));

// =============================================================================
// SERVICE RELATIONS
// =============================================================================
export const serviceCategoryRelations = relations(
  serviceCategories,
  ({ many }) => ({
    services: many(services),
  }),
);

export const serviceRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  createdBy: one(user, {
    fields: [services.createdBy],
    references: [user.id],
  }),
  dependencies: many(serviceDependencies, {
    relationName: "service_dependencies",
  }),
  dependents: many(serviceDependencies, { relationName: "dependent_services" }),
  pricingRules: many(pricingRules),
  quotationItems: many(quotationItems),
}));

export const serviceDependencyRelations = relations(
  serviceDependencies,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceDependencies.serviceId],
      references: [services.id],
      relationName: "service_dependencies",
    }),
    dependentService: one(services, {
      fields: [serviceDependencies.dependentServiceId],
      references: [services.id],
      relationName: "dependent_services",
    }),
  }),
);

export const pricingRuleRelations = relations(pricingRules, ({ one }) => ({
  service: one(services, {
    fields: [pricingRules.serviceId],
    references: [services.id],
  }),
  createdBy: one(user, {
    fields: [pricingRules.createdBy],
    references: [user.id],
  }),
}));

// =============================================================================
// CUSTOMER RELATIONS
// =============================================================================
export const customerRelations = relations(customers, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [customers.createdBy],
    references: [user.id],
  }),
  contacts: many(customerContacts),
  history: many(customerHistory),
  quotations: many(quotations),
  calculationLogs: many(calculationLogs),
  pricingCache: many(pricingCache),
}));

export const customerContactRelations = relations(
  customerContacts,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerContacts.customerId],
      references: [customers.id],
    }),
  }),
);

export const customerHistoryRelations = relations(
  customerHistory,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerHistory.customerId],
      references: [customers.id],
    }),
    performedBy: one(user, {
      fields: [customerHistory.performedBy],
      references: [user.id],
    }),
  }),
);

// =============================================================================
// QUOTATION RELATIONS
// =============================================================================
export const quotationRelations = relations(quotations, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id],
  }),
  createdBy: one(user, {
    fields: [quotations.createdBy],
    references: [user.id],
  }),
  parentQuote: one(quotations, {
    fields: [quotations.parentQuoteId],
    references: [quotations.id],
    relationName: "quote_revisions",
  }),
  revisions: many(quotations, { relationName: "quote_revisions" }),
  items: many(quotationItems),
  history: many(quotationHistory),
}));

export const quotationItemRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  service: one(services, {
    fields: [quotationItems.serviceId],
    references: [services.id],
  }),
}));

export const quotationHistoryRelations = relations(
  quotationHistory,
  ({ one }) => ({
    quotation: one(quotations, {
      fields: [quotationHistory.quotationId],
      references: [quotations.id],
    }),
    performedBy: one(user, {
      fields: [quotationHistory.performedBy],
      references: [user.id],
    }),
  }),
);

// =============================================================================
// PRICING RELATIONS
// =============================================================================
export const discountRuleRelations = relations(discountRules, ({ one }) => ({
  createdBy: one(user, {
    fields: [discountRules.createdBy],
    references: [user.id],
  }),
}));

export const calculationLogRelations = relations(
  calculationLogs,
  ({ one }) => ({
    user: one(user, {
      fields: [calculationLogs.userId],
      references: [user.id],
    }),
    customer: one(customers, {
      fields: [calculationLogs.customerId],
      references: [customers.id],
    }),
  }),
);

export const pricingCacheRelations = relations(pricingCache, ({ one }) => ({
  customer: one(customers, {
    fields: [pricingCache.customerId],
    references: [customers.id],
  }),
}));
