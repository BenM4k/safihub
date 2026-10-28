/**
 * Shared storage URL normalization utility.
 * Safe for use in both Server and Client Components (no server-only dependencies).
 */

/**
 * Normalizes a storage URL to ensure it can be displayed by the browser.
 * Rewrites broken legacy URLs (e.g. safihub.r2.dev, storage.safihub.cd)
 * to the working internal storage route (/api/storage/...).
 */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Preserve local relative storage routes, data URIs, and object blobs
  if (
    trimmed.startsWith("/api/storage/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Rewrite broken legacy domains (e.g. safihub.r2.dev, *.safihub.cd) to the app storage route
  if (
    trimmed.includes("safihub.r2.dev") ||
    trimmed.includes("safihub.cd")
  ) {
    const match = trimmed.match(/(?:houses\/[^\s?#]+)/);
    if (match) {
      return `/api/storage/${match[0]}`;
    }
  }

  return trimmed;
}
