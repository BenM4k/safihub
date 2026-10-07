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
  });

  describe("Server Action Error Handler (withActionErrorHandling)", () => {
    it("captures test errors in Sentry with user role but NO phone number", async () => {
      const testErrorMessage = "Test operational failure in courier mission";

      const actionResult = await withActionErrorHandling(
        "testCourierMissionAction",
        async () => {
          // Manually simulate attaching user context in Sentry
          Sentry.setUser({
            id: "usr_courier_02",
            role: "courier",
          });
          Sentry.setTag("user_role", "courier");

          throw new Error(testErrorMessage);
        }
      );

      // 1. Action returns standard Result shape without throwing
      expect(actionResult.ok).toBe(false);
      if (!actionResult.ok) {
        expect(actionResult.error).toContain(testErrorMessage);
      }

      // 2. Exception is captured in Sentry
      expect(mockCaptureException).toHaveBeenCalledTimes(1);
      const [capturedErr, captureContext] = mockCaptureException.mock.calls[0];
      expect((capturedErr as Error).message).toBe(testErrorMessage);

      // 3. Error has the action tag attached
      const contextObj = captureContext as { tags?: Record<string, string> } | undefined;
      expect(contextObj?.tags).toMatchObject({
        action: "testCourierMissionAction",
      });

      // 4. Sentry.setUser receives user role and NEVER receives a phone number
      expect(mockSetUser).toHaveBeenCalled();
      const lastUserCall = mockSetUser.mock.calls[mockSetUser.mock.calls.length - 1][0];
      expect(lastUserCall?.role).toBe("courier");
      expect((lastUserCall as Record<string, unknown> | null)?.phone).toBeUndefined();
      expect((lastUserCall as Record<string, unknown> | null)?.contactPhone).toBeUndefined();
      expect((lastUserCall as Record<string, unknown> | null)?.phoneNumber).toBeUndefined();

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
