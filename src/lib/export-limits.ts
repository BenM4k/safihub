export const DEFAULT_EXPORT_LIMIT = 5000;
export const MAX_EXPORT_LIMIT = 10000;

export function clampExportLimit(limit?: number): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return DEFAULT_EXPORT_LIMIT;
  }
  return Math.max(1, Math.min(MAX_EXPORT_LIMIT, Math.trunc(limit)));
}

export function clampExportOffset(offset?: number): number {
  if (typeof offset !== "number" || !Number.isFinite(offset)) {
    return 0;
  }
  return Math.max(0, Math.trunc(offset));
}
