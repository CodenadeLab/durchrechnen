// =============================================================================
// MAIN DATABASE SCHEMA - Modular Architecture
// =============================================================================

// Export all auth-related tables and types
export * from "./schemas/auth";

// Export all audit-related tables and types  
export * from "./schemas/audit";

// TODO: Add more schema modules as we build them:
// export * from "./schemas/services";
// export * from "./schemas/customers"; 
// export * from "./schemas/quotes";
// export * from "./schemas/pricing";

// =============================================================================
// SCHEMA RELATIONS (will be added as we create more modules)
// =============================================================================

// TODO: Define cross-module relations using Drizzle relations
// For example: customers -> quotes, services -> quotes, etc.