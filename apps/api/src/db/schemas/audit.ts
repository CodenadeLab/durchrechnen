// =============================================================================
// AUDIT SCHEMA MODULE - Compliance & Security Logging
// =============================================================================

import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";

// =============================================================================
// ENUMS
// =============================================================================

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "VIEW",
  "EXPORT",
  "CALCULATE",
]);

// =============================================================================
// AUDIT TABLES
// =============================================================================

// Immutable audit log for all system actions (GDPR/Compliance)
export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  action: auditActionEnum("action").notNull(),
  oldValues: jsonb("old_values"), // Previous state (null for CREATE)
  newValues: jsonb("new_values"), // New state (null for DELETE)
  userId: text("user_id").references(() => user.id), // Can be null for system actions
  userEmail: text("user_email"), // Redundant but helpful for deleted users
  ipAddress: text("ip_address"), // IPv4/IPv6
  userAgent: text("user_agent"),
  sessionId: text("session_id"), // Reference to session
  timestamp: timestamp("timestamp").notNull().defaultNow(),

  // Additional context fields
  module: text("module"), // e.g., "pricing", "customers", "quotes"
  context: jsonb("context"), // Additional metadata about the action
});

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

export const insertAuditLogSchema = createInsertSchema(auditLogs, {
  tableName: z.string().min(1, "Table name is required"),
  recordId: z.string().min(1, "Record ID is required"),
  action: z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "VIEW",
    "EXPORT",
    "CALCULATE",
  ]),
  ipAddress: z
    .string()
    .regex(
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/,
      "Invalid IP address",
    )
    .optional(),
  module: z.string().optional(),
});

export const selectAuditLogSchema = createSelectSchema(auditLogs);

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper to create audit log entries
export const createAuditEntry = (
  tableName: string,
  recordId: string,
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "VIEW"
    | "EXPORT"
    | "CALCULATE",
  options: {
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    oldValues?: any;
    newValues?: any;
    module?: string;
    context?: any;
  } = {},
): NewAuditLog => ({
  tableName,
  recordId,
  action,
  ...options,
});

// Module constants for consistent logging
export const AUDIT_MODULES = {
  AUTH: "auth",
  SERVICES: "services",
  CUSTOMERS: "customers",
  QUOTES: "quotes",
  PRICING: "pricing",
  REPORTS: "reports",
  ADMIN: "admin",
} as const;
