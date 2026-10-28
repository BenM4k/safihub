/**
 * Shared application base URL resolution utility.
 * Safe for use in Server and Client components.
 */

export function getAppBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;

  if (!envUrl) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[getAppBaseUrl] Warning: Neither NEXT_PUBLIC_APP_URL nor BETTER_AUTH_URL is defined in production. Falling back to http://localhost:3000."
      );
    }
    return "http://localhost:3000";
  }

  return envUrl.replace(/\/$/, "");
}

