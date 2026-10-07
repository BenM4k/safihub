import type { Event as SentryEvent } from "@sentry/nextjs";

/**
 * Privacy sanitizer for Sentry error monitoring.
 * Enforces the SafiHub Customer Privacy Firewall:
 * - Ensures user role is preserved.
 * - Strips all phone numbers (contactPhone, phoneNumber, phone) from user objects, tags, and extra metadata.
 */
export function scrubPhoneNumbers<T extends SentryEvent>(event: T): T {
  if (event.user) {
    const userObj = event.user as Record<string, unknown>;
    delete userObj.phone;
    delete userObj.phoneNumber;
    delete userObj.contactPhone;
    delete userObj.mobile;
  }

  if (event.tags) {
    for (const key of Object.keys(event.tags)) {
      if (/phone|contact_phone|contactphone/i.test(key)) {
        delete event.tags[key];
      }
    }
  }

  if (event.extra) {
    for (const key of Object.keys(event.extra)) {
      if (/phone|contact_phone|contactphone/i.test(key)) {
        delete event.extra[key];
      }
    }
  }

  return event;
}
