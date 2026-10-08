import * as Sentry from "@sentry/nextjs";
import { scrubPhoneNumbers } from "./lib/sentry-privacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  beforeSend(event) {
    return scrubPhoneNumbers(event);
  },
  beforeSendSpan(span) {
    return scrubPhoneNumbers(span);
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
