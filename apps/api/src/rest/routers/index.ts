// =============================================================================
// REST API ROUTERS - OpenAPI/Swagger Documentation
// =============================================================================

import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "../types";

// Create minimal router for now
export const routers = new OpenAPIHono<Context>();

// Health check endpoint (temporary)
routers.get("/api/status", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Durchrechnen API",
    timestamp: new Date().toISOString()
  });
});