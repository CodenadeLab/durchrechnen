import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./lib/auth";
import { checkHealth } from "./utils/health";
import { routers } from "./rest/routers";
import { appRouter } from "./trpc/routers/_app";

// Define context type with Better-Auth session
type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

app.use(secureHeaders());

// CORS for Better-Auth routes
app.use(
  "/api/auth/**",
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Client-Type", "Platform"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Better-Auth route handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Global CORS for all other routes
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || [],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: [
      "Authorization",
      "Content-Type",
      "accept-language",
      "X-Client-Type",
      "Platform",
    ],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  }),
);

// Better-Auth session middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});


// Mount REST routers (includes OAuth pages and API endpoints)
app.route("/", routers);

// Health check
app.get("/health", async (c) => {
  try {
    await checkHealth();
    return c.json({ status: "ok" }, 200);
  } catch (error) {
    return c.json({ status: "error" }, 500);
  }
});

// Protected session endpoint
app.get("/api/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");
  
  if (!user) {
    return c.body(null, 401);
  }

  return c.json({
    session,
    user
  });
});

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
const hostname = process.env.HOST || "0.0.0.0";

export default {
  port,
  hostname,
  fetch: app.fetch,
  development: process.env.NODE_ENV !== "production",
};