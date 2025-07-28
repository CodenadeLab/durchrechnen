// =============================================================================
// REST API ROUTERS - OpenAPI/Swagger Documentation
// =============================================================================

import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "../types";

// Create main REST router
export const routers = new OpenAPIHono<Context>();

// Health check endpoint
routers.get("/api/status", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Durchrechnen API",
    timestamp: new Date().toISOString()
  });
});