import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

/**
 * SafiHub client-side Better Auth instance.
 * Safe to import inside Client Components ("use client").
 * NEVER import server-side `auth.ts` or DAL files into Client Components.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    adminClient({
      ac,
      roles,
    }),
    /*
     * To enable phoneNumber authentication client plugin:
     * phoneNumberClient(),
     */
  ],
});

export const { useSession, signIn, signOut, signUp } = authClient;
