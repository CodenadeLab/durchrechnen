import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database URL from environment variables
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL!;
};

// Create database connection pool
const pool = postgres(getDatabaseUrl(), {
  prepare: false,
});

// Create and export database instance
export const db = drizzle(pool, {
  schema,
  casing: "snake_case",
});

// Simple connection function that returns the database instance
export const connectDb = async () => {
  return db;
};

export type Database = Awaited<ReturnType<typeof connectDb>>;
