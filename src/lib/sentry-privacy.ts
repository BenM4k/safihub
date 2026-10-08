const PHONE_KEY_REGEX = /phone|contact_phone|contactphone|mobile/i;
const PHONE_PATTERN = /(\+?243[\s.-]?\d{9}|\b0\d{9}\b)/g;

function isPhoneKey(key: string): boolean {
  return PHONE_KEY_REGEX.test(key);
}

function scrubPhoneString(text: string): string {
  return text.replace(PHONE_PATTERN, "[REDACTED_PHONE]");
}

function scrubObjectKeys(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (isPhoneKey(key)) {
      delete obj[key];
    } else if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      scrubObjectKeys(obj[key] as Record<string, unknown>);
    }
  }
}

/**
 * Privacy sanitizer for Sentry error monitoring and distributed tracing spans.
 * Enforces the SafiHub Customer Privacy Firewall:
 * - Preserves user role and non-PII diagnostic metadata.
 * - Strips all phone numbers from user objects, tags, extra metadata, span data,
 *   breadcrumbs, request payloads, contexts, and exception values.
 */
export function scrubPhoneNumbers<T>(item: T): T {
  if (!item || typeof item !== "object") {
    return item;
  }

  const target = item as Record<string, unknown>;

  // 1. Scrub User context
  if (target.user && typeof target.user === "object") {
    const userObj = target.user as Record<string, unknown>;
    delete userObj.phone;
    delete userObj.phoneNumber;
    delete userObj.contactPhone;
    delete userObj.mobile;
    scrubObjectKeys(userObj);
  }

  // 2. Scrub Tags
  if (target.tags && typeof target.tags === "object") {
    const tagsObj = target.tags as Record<string, unknown>;
    for (const key of Object.keys(tagsObj)) {
      if (isPhoneKey(key)) {
        delete tagsObj[key];
      }
    }
  }

  // 3. Scrub Extra metadata
  if (target.extra && typeof target.extra === "object") {
    scrubObjectKeys(target.extra as Record<string, unknown>);
  }

  // 4. Scrub Span Data & Attributes (distributed tracing spans)
  if (target.data && typeof target.data === "object") {
    scrubObjectKeys(target.data as Record<string, unknown>);
  }
  if (target.attributes && typeof target.attributes === "object") {
    scrubObjectKeys(target.attributes as Record<string, unknown>);
  }

  // 5. Scrub Breadcrumbs
  if (Array.isArray(target.breadcrumbs)) {
    for (const crumb of target.breadcrumbs) {
      if (crumb && typeof crumb === "object") {
        if (crumb.data && typeof crumb.data === "object") {
          scrubObjectKeys(crumb.data as Record<string, unknown>);
        }
        if (typeof crumb.message === "string") {
          crumb.message = scrubPhoneString(crumb.message);
        }
      }
    }
  }

  // 6. Scrub Request data
  if (target.request && typeof target.request === "object") {
    const req = target.request as Record<string, unknown>;
    if (req.data) {
      if (typeof req.data === "object") {
        scrubObjectKeys(req.data as Record<string, unknown>);
      } else if (typeof req.data === "string") {
        req.data = scrubPhoneString(req.data);
      }
    }
    if (req.cookies && typeof req.cookies === "object") {
      scrubObjectKeys(req.cookies as Record<string, unknown>);
    }
    if (req.headers && typeof req.headers === "object") {
      scrubObjectKeys(req.headers as Record<string, unknown>);
    }
    if (typeof req.query_string === "string") {
      req.query_string = scrubPhoneString(req.query_string);
    }
  }

  // 7. Scrub Contexts
  if (target.contexts && typeof target.contexts === "object") {
    for (const key of Object.keys(target.contexts)) {
      const ctx = (target.contexts as Record<string, unknown>)[key];
      if (ctx && typeof ctx === "object") {
        scrubObjectKeys(ctx as Record<string, unknown>);
      }
    }
  }

  // 8. Scrub Exception values
  if (target.exception && typeof target.exception === "object") {
    const exc = target.exception as { values?: Array<{ value?: string }> };
    if (Array.isArray(exc.values)) {
      for (const val of exc.values) {
        if (typeof val.value === "string") {
          val.value = scrubPhoneString(val.value);
        }
      }
    }
  }

  return item;
}
