// =============================================================================
// CUSTOMERS TRPC ROUTER - Customer & Contact Management
// =============================================================================

import { TRPCError } from "@trpc/server";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import {
  customerContacts,
  customerHistory,
  customers,
  insertCustomerContactSchema,
  insertCustomerHistorySchema,
  insertCustomerSchema,
  updateCustomerSchema,
} from "../../db/schema";
import { publicProcedure, router } from "../init";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const customerIdSchema = z.string().uuid("Invalid customer ID");
const contactIdSchema = z.string().uuid("Invalid contact ID");

const customerSearchSchema = z.object({
  query: z.string().optional(),
  segment: z.enum(["private", "sme", "enterprise"]).optional(),
  isVip: z.boolean().optional(),
  limit: z.number().int().positive().max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

// =============================================================================
// CUSTOMER PROCEDURES
// =============================================================================

const customersRouter = router({
  // List customers with search and filtering
  list: publicProcedure
    .input(customerSearchSchema)
    .query(async ({ ctx, input }) => {
      const filters = [];

      // Text search across name, email, company
      if (input.query) {
        filters.push(
          or(
            ilike(customers.name, `%${input.query}%`),
            ilike(customers.email, `%${input.query}%`),
            ilike(customers.companyName, `%${input.query}%`),
          ),
        );
      }

      // Segment filter
      if (input.segment) {
        filters.push(eq(customers.segment, input.segment));
      }

      // VIP filter
      if (input.isVip !== undefined) {
        filters.push(eq(customers.isVip, input.isVip));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      return await ctx.db
        .select()
        .from(customers)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(customers.name);
    }),

  // Get customer by ID with contacts
  getById: publicProcedure
    .input(customerIdSchema)
    .query(async ({ ctx, input }) => {
      // Get customer data
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.id, input))
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Get contacts for this customer
      const contacts = await ctx.db
        .select()
        .from(customerContacts)
        .where(eq(customerContacts.customerId, input))
        .orderBy(customerContacts.isPrimary);

      return {
        ...customer,
        contacts,
      };
    }),

  // Create new customer
  create: publicProcedure
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const [newCustomer] = await ctx.db
        .insert(customers)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newCustomer;
    }),

  // Update customer
  update: publicProcedure
    .input(
      z.object({
        id: customerIdSchema,
        data: updateCustomerSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedCustomer] = await ctx.db
        .update(customers)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, input.id))
        .returning();

      if (!updatedCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return updatedCustomer;
    }),

  // Delete customer (hard delete for now, can be changed to soft delete)
  delete: publicProcedure
    .input(customerIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Note: This will cascade delete contacts and history due to foreign key constraints
      const [deletedCustomer] = await ctx.db
        .delete(customers)
        .where(eq(customers.id, input))
        .returning();

      if (!deletedCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return { success: true };
    }),

  // Search customers by email
  findByEmail: publicProcedure
    .input(z.string().email("Invalid email format"))
    .query(async ({ ctx, input }) => {
      const [customer] = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.email, input))
        .limit(1);

      return customer || null;
    }),

  // Get customer statistics with SQL aggregation
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Use SQL aggregation for better performance
    const totalResult = await ctx.db
      .select({ count: count() })
      .from(customers)
      .limit(1);

    const segmentStats = await ctx.db
      .select({
        segment: customers.segment,
        count: count(),
      })
      .from(customers)
      .groupBy(customers.segment);

    const vipResult = await ctx.db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.isVip, true))
      .limit(1);

    const segmentMap = segmentStats.reduce(
      (acc, { segment, count }) => {
        acc[segment] = Number(count);
        return acc;
      },
      { private: 0, sme: 0, enterprise: 0 } as Record<string, number>,
    );

    return {
      total: Number(totalResult[0]?.count || 0),
      bySegment: segmentMap,
      vipCount: Number(vipResult[0]?.count || 0),
    };
  }),
});

// =============================================================================
// CUSTOMER CONTACTS PROCEDURES
// =============================================================================

const contactsRouter = router({
  // Get contacts for a customer
  getByCustomer: publicProcedure
    .input(customerIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(customerContacts)
        .where(eq(customerContacts.customerId, input))
        .orderBy(customerContacts.isPrimary, customerContacts.name);
    }),

  // Create new contact
  create: publicProcedure
    .input(insertCustomerContactSchema)
    .mutation(async ({ ctx, input }) => {
      // If this is marked as primary, unset other primary contacts for the customer
      if (input.isPrimary) {
        await ctx.db
          .update(customerContacts)
          .set({ isPrimary: false })
          .where(eq(customerContacts.customerId, input.customerId));
      }

      const [newContact] = await ctx.db
        .insert(customerContacts)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newContact;
    }),

  // Update contact
  update: publicProcedure
    .input(
      z.object({
        id: contactIdSchema,
        data: insertCustomerContactSchema.partial().omit({ customerId: true }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as primary, get customer ID first then unset others
      if (input.data.isPrimary) {
        const [contact] = await ctx.db
          .select()
          .from(customerContacts)
          .where(eq(customerContacts.id, input.id))
          .limit(1);

        if (contact) {
          await ctx.db
            .update(customerContacts)
            .set({ isPrimary: false })
            .where(eq(customerContacts.customerId, contact.customerId));
        }
      }

      const [updatedContact] = await ctx.db
        .update(customerContacts)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(customerContacts.id, input.id))
        .returning();

      if (!updatedContact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      return updatedContact;
    }),

  // Delete contact
  delete: publicProcedure
    .input(contactIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [deletedContact] = await ctx.db
        .delete(customerContacts)
        .where(eq(customerContacts.id, input))
        .returning();

      if (!deletedContact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      return { success: true };
    }),
});

// =============================================================================
// CUSTOMER HISTORY PROCEDURES
// =============================================================================

const historyRouter = router({
  // Get history for a customer
  getByCustomer: publicProcedure
    .input(
      z.object({
        customerId: customerIdSchema,
        limit: z.number().int().positive().max(100).optional().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(customerHistory)
        .where(eq(customerHistory.customerId, input.customerId))
        .orderBy(customerHistory.performedAt)
        .limit(input.limit);
    }),

  // Add history entry
  create: publicProcedure
    .input(insertCustomerHistorySchema)
    .mutation(async ({ ctx, input }) => {
      const [newEntry] = await ctx.db
        .insert(customerHistory)
        .values({
          ...input,
          performedAt: new Date(),
        })
        .returning();

      return newEntry;
    }),

  // Get recent activity across all customers
  getRecentActivity: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          history: customerHistory,
          customer: {
            id: customers.id,
            name: customers.name,
            companyName: customers.companyName,
          },
        })
        .from(customerHistory)
        .innerJoin(customers, eq(customerHistory.customerId, customers.id))
        .orderBy(customerHistory.performedAt)
        .limit(input.limit);

      return result.map((row) => ({
        ...row.history,
        customer: row.customer,
      }));
    }),
});

// =============================================================================
// MAIN CUSTOMERS ROUTER
// =============================================================================

export const customersMainRouter = router({
  customers: customersRouter,
  contacts: contactsRouter,
  history: historyRouter,
});
