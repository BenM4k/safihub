import "server-only";

export interface AnalyticsEventPayload {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

// In-memory capture log for test verification and privacy audit
const capturedEvents: AnalyticsEventPayload[] = [];

export function getCapturedAnalyticsEvents(): AnalyticsEventPayload[] {
  return [...capturedEvents];
}

export function clearCapturedAnalyticsEvents(): void {
  capturedEvents.length = 0;
}

// Forbidden PII property keys that must NEVER be sent to analytics
const FORBIDDEN_PII_KEYS = new Set([
  "phone",
  "contactphone",
  "phonenumber",
  "customerphone",
  "name",
  "customername",
  "firstname",
  "lastname",
  "address",
  "customeraddress",
  "landmark",
  "street",
  "email",
  "customeremail",
]);

const PHONE_REGEX = /(?:\+?243[0-9]{9}|0[0-9]{9}|\+?[0-9]{10,})/;
const EMAIL_REGEX = /\S+@\S+\.\S+/;

/**
 * Validates and cleanses event properties to strictly guarantee no PII is emitted.
 * Strips phone, name, address, landmark, and email fields.
 */
export function sanitizeAnalyticsProperties(
  props?: Record<string, unknown>
): Record<string, unknown> {
  if (!props) return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(props)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z]/g, "");

    // Drop forbidden keys immediately
    if (FORBIDDEN_PII_KEYS.has(lowerKey)) {
      continue;
    }

    if (typeof val === "string") {
      // Check for phone or email in values
      if (containsPii(val)) {
        continue; // Scrub string containing PII
      }
      sanitized[key] = val;
    } else if (Array.isArray(val)) {
      sanitized[key] = sanitizeAnalyticsArray(val);
    } else if (val !== null && typeof val === "object") {
      sanitized[key] = sanitizeAnalyticsProperties(val as Record<string, unknown>);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

function containsPii(val: string): boolean {
  return PHONE_REGEX.test(val) || EMAIL_REGEX.test(val);
}

/** Recursively sanitizes array elements; PII strings are dropped. */
function sanitizeAnalyticsArray(arr: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const el of arr) {
    if (typeof el === "string") {
      if (!containsPii(el)) out.push(el);
    } else if (Array.isArray(el)) {
      out.push(sanitizeAnalyticsArray(el));
    } else if (el !== null && typeof el === "object") {
      out.push(sanitizeAnalyticsProperties(el as Record<string, unknown>));
    } else {
      out.push(el);
    }
  }
  return out;
}

/**
 * Validates that distinctId does not contain PII like phone or email.
 */
export function sanitizeDistinctId(distinctId: string): string {
  if (PHONE_REGEX.test(distinctId) || EMAIL_REGEX.test(distinctId)) {
    // Replace with masked internal identifier
    return `anonymized_${crypto.randomUUID().slice(0, 8)}`;
  }
  return distinctId;
}

/**
 * Dispatches a server-side analytics event to PostHog with strict PII protection.
 */
export async function capturePostHogEvent(event: AnalyticsEventPayload): Promise<void> {
  const cleanDistinctId = sanitizeDistinctId(event.distinctId);
  const cleanProperties = sanitizeAnalyticsProperties(event.properties);

  const sanitizedPayload: AnalyticsEventPayload = {
    event: event.event,
    distinctId: cleanDistinctId,
    properties: cleanProperties,
    timestamp: event.timestamp || new Date(),
  };

  // Record in internal buffer only under test (avoids unbounded growth in prod)
  if (process.env.NODE_ENV === "test") {
    capturedEvents.push(sanitizedPayload);
  }

  const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey || process.env.NODE_ENV === "test") {
    // In tests or if key not configured, local logging/buffer is sufficient
    return;
  }

  const host = (process.env.POSTHOG_HOST || "https://eu.i.posthog.com").replace(/\/$/, "");

  try {
    // Fire-and-forget server fetch
    fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event: sanitizedPayload.event,
        distinct_id: sanitizedPayload.distinctId,
        properties: sanitizedPayload.properties,
        timestamp: sanitizedPayload.timestamp?.toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {
      // Fail silently to never interrupt business transactions
    });
  } catch {
    // Non-blocking
  }
}
