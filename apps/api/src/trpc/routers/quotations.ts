// =============================================================================
// QUOTATIONS TRPC ROUTER - Quotation & Status Management
// =============================================================================

import { TRPCError } from "@trpc/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import {
  customers,
  insertQuotationHistorySchema,
  insertQuotationItemSchema,
  insertQuotationSchema,
  quotationHistory,
  quotationItems,
  quotations,
  services,
  updateQuotationItemSchema,
  updateQuotationSchema,
} from "../../db/schema";
import { publicProcedure, router } from "../init";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const quotationIdSchema = z.string().uuid("Invalid quotation ID");
const itemIdSchema = z.string().uuid("Invalid item ID");

const quotationSearchSchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z
    .enum(["draft", "sent", "accepted", "rejected", "expired", "cancelled"])
    .optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().int().positive().max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

const quotationStatusUpdate = z.object({
  id: quotationIdSchema,
  status: z.enum([
    "draft",
    "sent",
    "accepted",
    "rejected",
    "expired",
    "cancelled",
  ]),
  notes: z.string().optional(),
});

// =============================================================================
// QUOTATION PROCEDURES
// =============================================================================

const quotationsRouter = router({
  // List quotations with filtering
  list: publicProcedure
    .input(quotationSearchSchema)
    .query(async ({ ctx, input }) => {
      const filters = [];

      if (input.customerId) {
        filters.push(eq(quotations.customerId, input.customerId));
      }

      if (input.status) {
        filters.push(eq(quotations.status, input.status));
      }

      if (input.dateFrom) {
        filters.push(gte(quotations.createdAt, input.dateFrom));
      }

      if (input.dateTo) {
        filters.push(lte(quotations.createdAt, input.dateTo));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const result = await ctx.db
        .select({
          quotation: quotations,
          customer: {
            id: customers.id,
            name: customers.name,
            companyName: customers.companyName,
            email: customers.email,
          },
        })
        .from(quotations)
        .innerJoin(customers, eq(quotations.customerId, customers.id))
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(quotations.createdAt);

      return result.map((row) => ({
        ...row.quotation,
        customer: row.customer,
      }));
    }),

  // Get quotation by ID with full details
  getById: publicProcedure
    .input(quotationIdSchema)
    .query(async ({ ctx, input }) => {
      // Get quotation with customer
      const quotationResult = await ctx.db
        .select({
          quotation: quotations,
          customer: customers,
        })
        .from(quotations)
        .innerJoin(customers, eq(quotations.customerId, customers.id))
        .where(eq(quotations.id, input))
        .limit(1);

      if (quotationResult.length === 0 || !quotationResult[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      const { quotation, customer } = quotationResult[0];

      // Get quotation items with service details
      const items = await ctx.db
        .select({
          item: quotationItems,
          service: {
            id: services.id,
            name: services.name,
            slug: services.slug,
            pricingModel: services.pricingModel,
          },
        })
        .from(quotationItems)
        .innerJoin(services, eq(quotationItems.serviceId, services.id))
        .where(eq(quotationItems.quotationId, input))
        .orderBy(quotationItems.position);

      return {
        ...quotation,
        customer,
        items: items.map((row) => ({
          ...row.item,
          service: row.service,
        })),
      };
    }),

  // Get quotation by quote number
  getByQuoteNumber: publicProcedure
    .input(z.string().min(1, "Quote number is required"))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          quotation: quotations,
          customer: customers,
        })
        .from(quotations)
        .innerJoin(customers, eq(quotations.customerId, customers.id))
        .where(eq(quotations.quoteNumber, input))
        .limit(1);

      if (result.length === 0 || !result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      const { quotation, customer } = result[0];
      return {
        ...quotation,
        customer,
      };
    }),

  // Create new quotation
  create: publicProcedure
    .input(
      insertQuotationSchema.extend({
        items: z
          .array(insertQuotationItemSchema.omit({ quotationId: true }))
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...quotationData } = input;

      // Verify customer exists
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.id, quotationData.customerId))
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Generate quote number (simplified - in production use atomic sequence)
      const year = new Date().getFullYear();
      const existingQuotes = await ctx.db
        .select()
        .from(quotations)
        .where(eq(quotations.quoteNumber, `Q-${year}-%`));

      const nextSequence = existingQuotes.length + 1;
      const quoteNumber = `Q-${year}-${nextSequence.toString().padStart(3, "0")}`;

      // Create quotation
      const newQuotations = await ctx.db
        .insert(quotations)
        .values({
          ...quotationData,
          quoteNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (newQuotations.length === 0 || !newQuotations[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create quotation",
        });
      }

      const newQuotation = newQuotations[0];

      // Create items if provided
      if (items && items.length > 0) {
        const itemsWithQuotationId = items.map((item) => ({
          ...item,
          quotationId: newQuotation.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await ctx.db.insert(quotationItems).values(itemsWithQuotationId);
      }

      // Log creation
      await ctx.db.insert(quotationHistory).values({
        quotationId: newQuotation.id,
        action: "created",
        description: "Quotation created",
        performedAt: new Date(),
      });

      return newQuotation;
    }),

  // Update quotation
  update: publicProcedure
    .input(
      z.object({
        id: quotationIdSchema,
        data: updateQuotationSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedQuotation] = await ctx.db
        .update(quotations)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(quotations.id, input.id))
        .returning();

      if (!updatedQuotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      // Log update
      await ctx.db.insert(quotationHistory).values({
        quotationId: input.id,
        action: "updated",
        description: "Quotation updated",
        performedAt: new Date(),
      });

      return updatedQuotation;
    }),

  // Update quotation status
  updateStatus: publicProcedure
    .input(quotationStatusUpdate)
    .mutation(async ({ ctx, input }) => {
      const [updatedQuotation] = await ctx.db
        .update(quotations)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(quotations.id, input.id))
        .returning();

      if (!updatedQuotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      // Log status change
      await ctx.db.insert(quotationHistory).values({
        quotationId: input.id,
        action: input.status === "draft" ? "updated" : input.status,
        description: input.notes || `Status changed to ${input.status}`,
        performedAt: new Date(),
      });

      return updatedQuotation;
    }),

  // Delete quotation
  delete: publicProcedure
    .input(quotationIdSchema)
    .mutation(async ({ ctx, input }) => {
      // This will cascade delete items and history
      const [deletedQuotation] = await ctx.db
        .delete(quotations)
        .where(eq(quotations.id, input))
        .returning();

      if (!deletedQuotation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quotation not found",
        });
      }

      return { success: true };
    }),

  // Duplicate quotation
  duplicate: publicProcedure
    .input(
      z.object({
        id: quotationIdSchema,
        newCustomerId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get original quotation with items
      const original = await ctx.db
        .select()
        .from(quotations)
        .where(eq(quotations.id, input.id))
        .limit(1);

      if (original.length === 0 || !original[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Original quotation not found",
        });
      }

      const originalQuote = original[0];

      const originalItems = await ctx.db
        .select()
        .from(quotationItems)
        .where(eq(quotationItems.quotationId, input.id));

      // Generate new quote number
      const year = new Date().getFullYear();
      const existingQuotes = await ctx.db.select().from(quotations);
      const nextSequence = existingQuotes.length + 1;
      const quoteNumber = `Q-${year}-${nextSequence.toString().padStart(3, "0")}`;
      const duplicatedQuotations = await ctx.db
        .insert(quotations)
        .values({
          quoteNumber,
          customerId: input.newCustomerId || originalQuote.customerId,
          validFrom: originalQuote.validFrom,
          validUntil: originalQuote.validUntil,
          status: "draft",
          subtotalAmount: originalQuote.subtotalAmount,
          discountAmount: originalQuote.discountAmount,
          taxAmount: originalQuote.taxAmount,
          totalAmount: originalQuote.totalAmount,
          version: 1,
          parentQuoteId: input.id,
          notes: originalQuote.notes,
          customerNotes: originalQuote.customerNotes,
          termsConditions: originalQuote.termsConditions,
          templateId: originalQuote.templateId,
          tags: originalQuote.tags,
          metadata: originalQuote.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (duplicatedQuotations.length === 0 || !duplicatedQuotations[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to duplicate quotation",
        });
      }

      const duplicatedQuotation = duplicatedQuotations[0];

      // Duplicate items
      if (originalItems.length > 0) {
        const duplicatedItems = originalItems.map((item) => ({
          quotationId: duplicatedQuotation.id,
          serviceId: item.serviceId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          discountPercentage: item.discountPercentage,
          discountAmount: item.discountAmount,
          finalPrice: item.finalPrice,
          complexity: item.complexity,
          customConfiguration: item.customConfiguration,
          position: item.position,
          isOptional: item.isOptional,
          notes: item.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await ctx.db.insert(quotationItems).values(duplicatedItems);
      }

      return duplicatedQuotation;
    }),
});

// =============================================================================
// QUOTATION ITEMS PROCEDURES
// =============================================================================

const itemsRouter = router({
  // Get items for a quotation
  getByQuotation: publicProcedure
    .input(quotationIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          item: quotationItems,
          service: services,
        })
        .from(quotationItems)
        .innerJoin(services, eq(quotationItems.serviceId, services.id))
        .where(eq(quotationItems.quotationId, input))
        .orderBy(quotationItems.position);

      return result.map((row) => ({
        ...row.item,
        service: row.service,
      }));
    }),

  // Add item to quotation
  create: publicProcedure
    .input(insertQuotationItemSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify service exists
      const [service] = await ctx.db
        .select()
        .from(services)
        .where(eq(services.id, input.serviceId))
        .limit(1);

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      const [newItem] = await ctx.db
        .insert(quotationItems)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newItem;
    }),

  // Update quotation item
  update: publicProcedure
    .input(
      z.object({
        id: itemIdSchema,
        data: updateQuotationItemSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedItem] = await ctx.db
        .update(quotationItems)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(quotationItems.id, input.id))
        .returning();

      if (!updatedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      return updatedItem;
    }),

  // Delete quotation item
  delete: publicProcedure
    .input(itemIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [deletedItem] = await ctx.db
        .delete(quotationItems)
        .where(eq(quotationItems.id, input))
        .returning();

      if (!deletedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      return { success: true };
    }),
});

// =============================================================================
// QUOTATION HISTORY PROCEDURES
// =============================================================================

const historyRouter = router({
  // Get history for a quotation
  getByQuotation: publicProcedure
    .input(quotationIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(quotationHistory)
        .where(eq(quotationHistory.quotationId, input))
        .orderBy(quotationHistory.performedAt);
    }),

  // Add history entry
  create: publicProcedure
    .input(insertQuotationHistorySchema)
    .mutation(async ({ ctx, input }) => {
      const [newEntry] = await ctx.db
        .insert(quotationHistory)
        .values({
          ...input,
          performedAt: new Date(),
        })
        .returning();

      return newEntry;
    }),
});

// =============================================================================
// MAIN QUOTATIONS ROUTER
// =============================================================================

export const quotationsMainRouter = router({
  quotations: quotationsRouter,
  items: itemsRouter,
  history: historyRouter,
});
