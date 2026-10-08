"use server";

import { withActionErrorHandling } from "@/lib/action-error-handler";
import { err, type Result } from "@/lib/result";

/**
 * Test server action to verify that Sentry captures errors end-to-end
 * with user role and no phone number.
 */
export async function triggerTestSentryErrorAction(): Promise<Result<{ triggered: boolean }>> {
  return withActionErrorHandling("triggerTestSentryError", async ({ user }) => {
    if (process.env.NODE_ENV === "production" && user?.role !== "admin") {
      return err("Unauthorized: Admin privileges required in production.");
    }

    throw new Error(
      `Sentry Verification Error [role: ${user?.role || "customer"}] - Customer Privacy Firewall verified.`
    );
  });
}
