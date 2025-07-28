// =============================================================================
// TRPC APP ROUTER - Type-safe API endpoints
// =============================================================================

import { publicProcedure, router } from "../init";

// Create minimal tRPC router for now
export const appRouter = router({
  // Health check procedure
  health: publicProcedure.query(() => ({
    status: "ok",
    service: "Durchrechnen tRPC",
    timestamp: new Date().toISOString(),
  })),
});

// Export type definition for client
export type AppRouter = typeof appRouter;
