import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/dal";
import { sendPasswordResetEmail } from "@/services/email";

import { ac, roles } from "./permissions";

function getAuthSecret(): string {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error(
        "BETTER_AUTH_SECRET environment variable is missing in production. Application startup aborted."
      );
    }
    return process.env.BETTER_AUTH_SECRET;
  }
  return (
    process.env.BETTER_AUTH_SECRET ||
    "default_dev_secret_must_be_overridden_in_production_32chars"
  );
}

/**
 * SafiHub Better Auth server instance.
 * Configured with Drizzle PostgreSQL adapter, email+password sign-in,
 * session persistence (freshAge: 0), admin plugin, and custom user fields.
 *
 * NOTE: The phoneNumber plugin is kept out of the first release version to avoid
 * expensive SMS OTP infrastructure before launch, as decided in product-spec.md.
 * The plugin architecture below is structured so enabling it requires only importing
 * `phoneNumber` from "better-auth/plugins/phone-number" and adding it to the plugins array.
 */
export const auth = betterAuth({
  secret: getAuthSecret(),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  session: {
    freshAge: 0,
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendPasswordResetEmail({
        email: user.email,
        resetUrl: url,
        token,
      });
    },
  },
  user: {
    additionalFields: {
      contactPhone: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },
      isGuest: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
        returned: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
        returned: true,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userRecord = await db.query.user.findFirst({
            where: (users, { eq }) => eq(users.id, session.userId),
          });
          if (userRecord?.status === "blocked" || userRecord?.banned) {
            throw new Error("Account is blocked. Please contact support.");
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin"],
      ac,
      roles,
      bannedUserMessage: "Account is blocked. Please contact support.",
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
