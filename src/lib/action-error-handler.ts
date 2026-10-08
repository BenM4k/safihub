import "server-only";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth } from "@/services/auth/auth";
import { err, type Result } from "@/lib/result";

export interface SafeActionContext {
  user: {
    id: string;
    role: string;
  } | null;
}

export interface ActionErrorOptions {
  headers?: Headers;
}

/**
 * Shared error-handling helper for SafiHub Server Actions.
 * - Wraps execution with Sentry server action instrumentation.
 * - Enforces the Customer Privacy Firewall: attaches user role to Sentry scope while NEVER attaching phone numbers.
 * - Catches any unhandled exceptions, logs them to Sentry, and returns a standard Result `{ ok: false, error: string }`.
 */
export async function withActionErrorHandling<T>(
  actionName: string,
  fn: (ctx: SafeActionContext) => Promise<Result<T>>,
  options?: ActionErrorOptions
): Promise<Result<T>> {
  return Sentry.withServerActionInstrumentation(
    actionName,
    { recordResponse: false },
    async () => {
      let userContext: SafeActionContext["user"] = null;

      try {
        const reqHeaders = options?.headers ?? (await headers());
        const session = await auth.api.getSession({ headers: reqHeaders });
        if (session?.user) {
          const rawRole = (session.user as Record<string, unknown>).role;
          const role = typeof rawRole === "string" ? rawRole : "customer";

          userContext = {
            id: session.user.id,
            role,
          };

          // Strict Customer Privacy Firewall: ONLY record user id and role in Sentry.
          // NEVER attach contactPhone, phone, or precise street landmark.
          Sentry.setUser({
            id: session.user.id,
            role,
          });
          Sentry.setTag("user_role", role);
        }
      } catch {
        // Session resolution is non-blocking for unauthenticated or outside-request flows
      }

      try {
        return await fn({ user: userContext });
      } catch (error) {
        // Capture unhandled exception in Sentry with user role metadata
        Sentry.captureException(error, {
          tags: {
            action: actionName,
            ...(userContext?.role ? { user_role: userContext.role } : {}),
          },
        });

        let errorMessage = "Une erreur inattendue est survenue.";
        try {
          const t = await getTranslations("errors");
          errorMessage = t("generic");
        } catch {
          // Fallback if translations cannot be loaded
        }

        return err(errorMessage);
      }
    }
  );
}

/**
 * Form action error-handling helper matching React 19 `useActionState` contract.
 * Wraps form actions that return `{ success: boolean, errors?: Record<string, string>, message?: string }`.
 */
export async function withFormActionErrorHandling<TState extends { success: boolean; errors?: Record<string, string>; message?: string }>(
  actionName: string,
  fn: (ctx: SafeActionContext) => Promise<TState>,
  fallbackState: TState,
  options?: ActionErrorOptions
): Promise<TState> {
  return Sentry.withServerActionInstrumentation(
    actionName,
    { recordResponse: false },
    async () => {
      let userContext: SafeActionContext["user"] = null;

      try {
        const reqHeaders = options?.headers ?? (await headers());
        const session = await auth.api.getSession({ headers: reqHeaders });
        if (session?.user) {
          const rawRole = (session.user as Record<string, unknown>).role;
          const role = typeof rawRole === "string" ? rawRole : "customer";
          userContext = { id: session.user.id, role };

          Sentry.setUser({ id: session.user.id, role });
          Sentry.setTag("user_role", role);
        }
      } catch {
        // No session
      }

      try {
        return await fn({ user: userContext });
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            action: actionName,
            ...(userContext?.role ? { user_role: userContext.role } : {}),
          },
        });

        let message = "Une erreur inattendue est survenue.";
        try {
          const t = await getTranslations("errors");
          message = t("generic");
        } catch {
          // Fallback if translations cannot be loaded
        }

        return {
          ...fallbackState,
          success: false,
          errors: { form: message },
          message,
        };
      }
    }
  );
}
