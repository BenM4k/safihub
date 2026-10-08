import { describe, expect, it, vi, beforeEach } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { withActionErrorHandling } from "@/lib/action-error-handler";
import { scrubPhoneNumbers } from "@/lib/sentry-privacy";
import { ok, err } from "@/lib/result";

const mockCaptureException = vi.fn();
const mockSetUser = vi.fn();
const mockSetTag = vi.fn();

vi.mock("@sentry/nextjs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@sentry/nextjs")>();
  return {
    ...actual,
    captureException: (...args: unknown[]) => mockCaptureException(...args),
    setUser: (...args: unknown[]) => mockSetUser(...args),
    setTag: (...args: unknown[]) => mockSetTag(...args),
    withServerActionInstrumentation: vi.fn(
      (_name: string, _options: unknown, callback: () => unknown) => callback()
    ),
  };
});

vi.mock("@/services/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("Sentry Error Handling & Privacy Firewall", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sentry Privacy Sanitizer", () => {
    it("scrubs phone numbers from user object, tags, and extra metadata while preserving the role", () => {
      const rawEvent = {
        event_id: "test_event_123",
        user: {
          id: "usr_courier_01",
          role: "courier",
          contactPhone: "+243999000111",
          phone: "+243999000111",
          phoneNumber: "+243999000111",
          mobile: "+243999000111",
        },
        tags: {
          action: "completePickup",
          user_role: "courier",
          customer_phone: "+243888777666",
        },
        extra: {
          courier_id: "usr_courier_01",
          contactPhone: "+243999000111",
          other_meta: "safe_data",
        },
      };

      const sanitized = scrubPhoneNumbers(rawEvent as unknown as Sentry.Event);

      // Verify user role is preserved
      expect(sanitized.user?.role).toBe("courier");
      expect(sanitized.user?.id).toBe("usr_courier_01");

      // Verify all phone number fields are scrubbed from user
      const user = sanitized.user as Record<string, unknown>;
      expect(user.contactPhone).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.phoneNumber).toBeUndefined();
      expect(user.mobile).toBeUndefined();

      // Verify phone tags are scrubbed while user_role is kept
      expect(sanitized.tags?.user_role).toBe("courier");
      expect(sanitized.tags?.customer_phone).toBeUndefined();

      // Verify extra phone metadata is scrubbed
      expect(sanitized.extra?.other_meta).toBe("safe_data");
      expect(sanitized.extra?.contactPhone).toBeUndefined();
    });

    it("scrubs phone numbers from span data, attributes, breadcrumbs, request data, contexts, and exceptions", () => {
      const span = {
        span_id: "span_123",
        data: {
          phone: "+243999000111",
          safe_attr: "value",
        },
        attributes: {
          contact_phone: "+243888777666",
          status: "ok",
        },
      };

      const sanitizedSpan = scrubPhoneNumbers(span);
      expect((sanitizedSpan.data as Record<string, unknown>).phone).toBeUndefined();
      expect((sanitizedSpan.data as Record<string, unknown>).safe_attr).toBe("value");
      expect((sanitizedSpan.attributes as Record<string, unknown>).contact_phone).toBeUndefined();
      expect((sanitizedSpan.attributes as Record<string, unknown>).status).toBe("ok");

      const event = {
        breadcrumbs: [
          { message: "User phone is +243999000111", data: { phone: "0999000111", ok: 1 } },
        ],
        request: {
          data: { customer_phone: "+243888777666", orderId: "123" },
          cookies: { session_phone: "+243123456789" },
        },
        contexts: {
          customer: { phone: "+243999000111", name: "Amani" },
        },
        exception: {
          values: [{ value: "Error with customer +243999000111" }],
        },
      };

      const sanitizedEvent = scrubPhoneNumbers(event);
      expect(sanitizedEvent.breadcrumbs[0].data.phone).toBeUndefined();
      expect(sanitizedEvent.breadcrumbs[0].data.ok).toBe(1);
      expect(sanitizedEvent.breadcrumbs[0].message).toContain("[REDACTED_PHONE]");
      expect(sanitizedEvent.request.data.customer_phone).toBeUndefined();
      expect(sanitizedEvent.request.data.orderId).toBe("123");
      expect(sanitizedEvent.request.cookies.session_phone).toBeUndefined();
      expect(sanitizedEvent.contexts.customer.phone).toBeUndefined();
      expect(sanitizedEvent.contexts.customer.name).toBe("Amani");
      expect(sanitizedEvent.exception.values[0].value).toContain("[REDACTED_PHONE]");
    });
  });

  describe("Server Action Error Handler (withActionErrorHandling)", () => {
    it("captures test errors in Sentry with user role but NO phone number", async () => {
      const { auth } = await import("@/services/auth/auth");
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: {
          id: "usr_courier_02",
          email: "courier@safihub.cd",
          name: "Courier Test",
          role: "courier",
          contactPhone: "+243999000111",
        },
        session: {
          id: "sess_123",
          userId: "usr_courier_02",
          expiresAt: new Date(),
        },
      } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const testErrorMessage = "Test operational failure in courier mission";
      const headers = new Headers({ "x-test": "true" });

      const actionResult = await withActionErrorHandling(
        "testCourierMissionAction",
        async () => {
          throw new Error(testErrorMessage);
        },
        { headers }
      );

      // 1. Action returns standard Result shape with localized error without throwing
      expect(actionResult.ok).toBe(false);
      if (!actionResult.ok) {
        expect(typeof actionResult.error).toBe("string");
      }

      // 2. Exception is captured in Sentry
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      const [capturedErr, captureContext] = mockCaptureException.mock.calls[0];
      expect((capturedErr as Error).message).toBe(testErrorMessage);

      // 3. Error has the action tag and user_role tag attached
      const contextObj = captureContext as { tags?: Record<string, string> } | undefined;
      expect(contextObj?.tags).toMatchObject({
        action: "testCourierMissionAction",
        user_role: "courier",
      });

      // 4. Sentry.setUser receives user id and role and NEVER receives a phone number
      expect(mockSetUser).toHaveBeenCalledWith({
        id: "usr_courier_02",
        role: "courier",
      });

      // 5. Sentry tag contains user_role
      expect(mockSetTag).toHaveBeenCalledWith("user_role", "courier");
    });

    it("returns successful Result value when action completes normally", async () => {
      const actionResult = await withActionErrorHandling(
        "successfulAction",
        async () => {
          return ok({ missionId: "msn_123", status: "completed" });
        }
      );

      expect(actionResult.ok).toBe(true);
      if (actionResult.ok) {
        expect(actionResult.value.missionId).toBe("msn_123");
      }
      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it("returns Err Result value when action returns domain error without capturing as uncaught exception", async () => {
      const actionResult = await withActionErrorHandling(
        "domainErrorAction",
        async () => {
          return err("Invalid pickup slot requested");
        }
      );

      expect(actionResult.ok).toBe(false);
      if (!actionResult.ok) {
        expect(actionResult.error).toBe("Invalid pickup slot requested");
      }
      expect(mockCaptureException).not.toHaveBeenCalled();
    });
  });
});
