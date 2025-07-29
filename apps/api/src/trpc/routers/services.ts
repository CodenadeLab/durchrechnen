// =============================================================================
// SERVICES TRPC ROUTER - Service & Category Management
// =============================================================================

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  insertServiceCategorySchema,
  insertServiceSchema,
  serviceCategories,
  services,
  updateServiceCategorySchema,
  updateServiceSchema,
} from "../../db/schema";
import { publicProcedure, router } from "../init";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const serviceIdSchema = z.string().uuid("Invalid service ID");
const categoryIdSchema = z.string().uuid("Invalid category ID");
const slugSchema = z.string().min(1, "Slug is required");

// =============================================================================
// SERVICE CATEGORIES PROCEDURES
// =============================================================================

const categoriesRouter = router({
  // List all categories with optional active filter
  list: publicProcedure
    .input(
      z.object({
        includeInactive: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause = input.includeInactive
        ? undefined
        : eq(serviceCategories.isActive, true);

      return await ctx.db
        .select()
        .from(serviceCategories)
        .where(whereClause)
        .orderBy(serviceCategories.sortOrder);
    }),

  // Get category by ID
  getById: publicProcedure
    .input(categoryIdSchema)
    .query(async ({ ctx, input }) => {
      const [category] = await ctx.db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, input))
        .limit(1);

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Get category by slug
  getBySlug: publicProcedure.input(slugSchema).query(async ({ ctx, input }) => {
    const [category] = await ctx.db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.slug, input))
      .limit(1);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }),

  // Create new category
  create: publicProcedure
    .input(insertServiceCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const [newCategory] = await ctx.db
        .insert(serviceCategories)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newCategory;
    }),

  // Update category
  update: publicProcedure
    .input(
      z.object({
        id: categoryIdSchema,
        data: updateServiceCategorySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedCategory] = await ctx.db
        .update(serviceCategories)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(serviceCategories.id, input.id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return updatedCategory;
    }),

  // Delete category (soft delete by setting isActive = false)
  delete: publicProcedure
    .input(categoryIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [deletedCategory] = await ctx.db
        .update(serviceCategories)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(serviceCategories.id, input))
        .returning();

      if (!deletedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return { success: true };
    }),
});

// =============================================================================
// SERVICES PROCEDURES
// =============================================================================

const servicesRouter = router({
  // List all services with optional filters
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().optional(),
        includeInactive: z.boolean().optional().default(false),
        isPopular: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filters = [];

      if (input.categoryId) {
        filters.push(eq(services.categoryId, input.categoryId));
      }

      if (!input.includeInactive) {
        filters.push(eq(services.isActive, true));
      }

      if (input.isPopular !== undefined) {
        filters.push(eq(services.isPopular, input.isPopular));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      return await ctx.db
        .select()
        .from(services)
        .where(whereClause)
        .orderBy(services.sortOrder);
    }),

  // Get service by ID with category relation
  getById: publicProcedure
    .input(serviceIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          service: services,
          category: serviceCategories,
        })
        .from(services)
        .leftJoin(
          serviceCategories,
          eq(services.categoryId, serviceCategories.id),
        )
        .where(eq(services.id, input))
        .limit(1);

      if (result.length === 0 || !result[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      const { service, category } = result[0];
      return {
        ...service,
        category,
      };
    }),

  // Get service by slug
  getBySlug: publicProcedure.input(slugSchema).query(async ({ ctx, input }) => {
    const result = await ctx.db
      .select({
        service: services,
        category: serviceCategories,
      })
      .from(services)
      .leftJoin(
        serviceCategories,
        eq(services.categoryId, serviceCategories.id),
      )
      .where(eq(services.slug, input))
      .limit(1);

    if (result.length === 0 || !result[0]) {
      throw new Error("Service not found");
    }

    const { service, category } = result[0];
    return {
      ...service,
      category,
    };
  }),

  // Create new service
  create: publicProcedure
    .input(insertServiceSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify category exists
      const [category] = await ctx.db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, input.categoryId))
        .limit(1);

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const [newService] = await ctx.db
        .insert(services)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newService;
    }),

  // Update service
  update: publicProcedure
    .input(
      z.object({
        id: serviceIdSchema,
        data: updateServiceSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If categoryId is being updated, verify it exists
      if (input.data.categoryId) {
        const [category] = await ctx.db
          .select()
          .from(serviceCategories)
          .where(eq(serviceCategories.id, input.data.categoryId))
          .limit(1);

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }
      }

      const [updatedService] = await ctx.db
        .update(services)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(eq(services.id, input.id))
        .returning();

      if (!updatedService) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      return updatedService;
    }),

  // Delete service (soft delete by setting isActive = false)
  delete: publicProcedure
    .input(serviceIdSchema)
    .mutation(async ({ ctx, input }) => {
      const [deletedService] = await ctx.db
        .update(services)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(services.id, input))
        .returning();

      if (!deletedService) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      return { success: true };
    }),

  // Get services by category (convenience method)
  getByCategory: publicProcedure
    .input(
      z.object({
        categorySlug: slugSchema,
        includeInactive: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          service: services,
          category: serviceCategories,
        })
        .from(services)
        .innerJoin(
          serviceCategories,
          eq(services.categoryId, serviceCategories.id),
        )
        .where(
          input.includeInactive
            ? eq(serviceCategories.slug, input.categorySlug)
            : eq(serviceCategories.slug, input.categorySlug) &&
                eq(services.isActive, true),
        )
        .orderBy(services.sortOrder);

      return result.map((row) => ({
        ...row.service,
        category: row.category,
      }));
    }),
});

// =============================================================================
// MAIN SERVICES ROUTER
// =============================================================================

export const servicesMainRouter = router({
  categories: categoriesRouter,
  services: servicesRouter,
});
