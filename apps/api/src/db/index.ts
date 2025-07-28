import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

// Configure WebSocket for Node.js environments
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

// For serverless/edge environments, enable querying over fetch
// neonConfig.poolQueryViaFetch = true;

// Get database URL from environment variables
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL!;
};

// Create Neon serverless client
const sql = neon(getDatabaseUrl());

// Create and export database instance
export const db = drizzle(sql, {
  schema,
  casing: "snake_case",
});

// Simple connection function that returns the database instance
export const connectDb = async () => {
  return db;
};

export type Database = Awaited<ReturnType<typeof connectDb>>;
