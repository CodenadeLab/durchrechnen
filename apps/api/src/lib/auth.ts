import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
  baseURL: process.env.BASE_URL || "http://localhost:3003",
  secret: process.env.AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // Disable email/password - only Google SSO
  emailAndPassword: {
    enabled: false,
  },
  // Enable Google OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Custom user fields for business needs
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "sales_employee",
        validate: (value: string) => {
          return ["admin", "sales_manager", "sales_employee"].includes(value);
        },
      },
      isActive: {
        type: "boolean", 
        defaultValue: true,
      },
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  rateLimit: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;