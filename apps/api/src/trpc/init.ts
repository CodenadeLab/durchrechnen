// =============================================================================
// TRPC INITIALIZATION - Context and Router Setup
// =============================================================================

import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { db } from "../db";

// Create context for tRPC
export const createTRPCContext = (opts: FetchCreateContextFnOptions) => {
  return {
    db,
    req: opts.req,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Export reusable router and procedure builders
export const router = t.router;
export const publicProcedure = t.procedure;
