import { sql } from "drizzle-orm";
import { connectDb } from "../db";
import { executeRead } from "../db/read-helpers";

export async function checkHealth() {
  const db = await connectDb();
  await executeRead(db, sql`SELECT 1`);
}
