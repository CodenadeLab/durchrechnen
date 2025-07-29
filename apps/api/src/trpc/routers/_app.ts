// =============================================================================
// TRPC APP ROUTER - Type-safe API endpoints
// =============================================================================

import { publicProcedure, router } from "../init";
import { customersMainRouter } from "./customers";
import { quotationsMainRouter } from "./quotations";
import { servicesMainRouter } from "./services";

// Create comprehensive tRPC router with all business modules
export const appRouter = router({
  // Health check procedure
  health: publicProcedure.query(() => ({
    status: "ok",
    service: "Durchrechnen tRPC",
    timestamp: new Date().toISOString(),
  })),

  // Business routers
  services: servicesMainRouter,
  customers: customersMainRouter,
  quotations: quotationsMainRouter,
  // pricing: will be added in DUR-8 (Pricing Engine Issue)
});

// Export type definition for client
export type AppRouter = typeof appRouter;
