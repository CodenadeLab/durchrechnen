import type { Config } from "drizzle-kit";

// Determine database URL based on deployment scope
const getDatabaseUrl = () => {
  const deploymentScope = process.env.DEPLOYMENT_SCOPE || "germany";
  
  switch (deploymentScope) {
    case "europe":
      // Multi-region European deployment
      return process.env.DATABASE_SESSION_POOLER!;
    case "global":
      // Global deployment (Europe + Americas)
      return process.env.DATABASE_GLOBAL_POOLER!;
    case "germany":
    default:
      // Single-region Germany deployment (current)
      return process.env.DATABASE_URL!;
  }
};

export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  schemaFilter: ["public"], // Only manage public schema, exclude auth schema to avoid conflicts
  tablesFilter: ["!auth.*"], // Exclude all auth schema tables from migrations
} satisfies Config;
