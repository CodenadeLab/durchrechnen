import { relations } from "drizzle-orm/relations";
import {
  account,
  auditLogs,
  calculationLogs,
  customerContacts,
  customerHistory,
  customers,
  discountRules,
  pricingCache,
  pricingRules,
  quotationHistory,
  quotationItems,
  quotations,
  serviceCategories,
  serviceDependencies,
  services,
  session,
  user,
} from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  auditLogs: many(auditLogs),
  services: many(services),
  quotationHistories: many(quotationHistory),
  customerHistories: many(customerHistory),
  customers: many(customers),
  pricingRules: many(pricingRules),
  quotations: many(quotations),
  calculationLogs: many(calculationLogs),
  discountRules: many(discountRules),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(user, {
    fields: [auditLogs.userId],
    references: [user.id],
  }),
}));

export const serviceDependenciesRelations = relations(
  serviceDependencies,
  ({ one }) => ({
    service_serviceId: one(services, {
      fields: [serviceDependencies.serviceId],
      references: [services.id],
      relationName: "serviceDependencies_serviceId_services_id",
    }),
    service_dependentServiceId: one(services, {
      fields: [serviceDependencies.dependentServiceId],
      references: [services.id],
      relationName: "serviceDependencies_dependentServiceId_services_id",
    }),
  }),
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  serviceDependencies_serviceId: many(serviceDependencies, {
    relationName: "serviceDependencies_serviceId_services_id",
  }),
  serviceDependencies_dependentServiceId: many(serviceDependencies, {
    relationName: "serviceDependencies_dependentServiceId_services_id",
  }),
  serviceCategory: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  user: one(user, {
    fields: [services.createdBy],
    references: [user.id],
  }),
  quotationItems: many(quotationItems),
  pricingRules: many(pricingRules),
}));

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ many }) => ({
    services: many(services),
  }),
);

export const quotationHistoryRelations = relations(
  quotationHistory,
  ({ one }) => ({
    quotation: one(quotations, {
      fields: [quotationHistory.quotationId],
      references: [quotations.id],
    }),
    user: one(user, {
      fields: [quotationHistory.performedBy],
      references: [user.id],
    }),
  }),
);

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  quotationHistories: many(quotationHistory),
  quotationItems: many(quotationItems),
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id],
  }),
  user: one(user, {
    fields: [quotations.createdBy],
    references: [user.id],
  }),
}));

export const customerHistoryRelations = relations(
  customerHistory,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerHistory.customerId],
      references: [customers.id],
    }),
    user: one(user, {
      fields: [customerHistory.performedBy],
      references: [user.id],
    }),
  }),
);

export const customersRelations = relations(customers, ({ one, many }) => ({
  customerHistories: many(customerHistory),
  user: one(user, {
    fields: [customers.createdBy],
    references: [user.id],
  }),
  customerContacts: many(customerContacts),
  quotations: many(quotations),
  calculationLogs: many(calculationLogs),
  pricingCaches: many(pricingCache),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  service: one(services, {
    fields: [quotationItems.serviceId],
    references: [services.id],
  }),
}));

export const pricingRulesRelations = relations(pricingRules, ({ one }) => ({
  service: one(services, {
    fields: [pricingRules.serviceId],
    references: [services.id],
  }),
  user: one(user, {
    fields: [pricingRules.createdBy],
    references: [user.id],
  }),
}));

export const customerContactsRelations = relations(
  customerContacts,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerContacts.customerId],
      references: [customers.id],
    }),
  }),
);

export const calculationLogsRelations = relations(
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

export const discountRulesRelations = relations(discountRules, ({ one }) => ({
  user: one(user, {
    fields: [discountRules.createdBy],
    references: [user.id],
  }),
}));

export const pricingCacheRelations = relations(pricingCache, ({ one }) => ({
  customer: one(customers, {
    fields: [pricingCache.customerId],
    references: [customers.id],
  }),
}));
