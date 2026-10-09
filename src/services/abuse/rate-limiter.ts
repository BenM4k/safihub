import "server-only";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes
const PRUNE_INTERVAL_MS = 10 * 60 * 1000;
let lastPruned = Date.now();

function pruneExpiredEntries(now: number): void {
  if (now - lastPruned < PRUNE_INTERVAL_MS) return;
  lastPruned = now;

  const maxRetentionMs = 60 * 60 * 1000; // 1 hour max retention
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxRetentionMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks and records an attempt for a given rate limit key using sliding window.
 */
export function recordRateLimitHit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const windowMs = windowSeconds * 1000;
  let record = rateLimitStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0] ?? now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);
  const resetSeconds = windowSeconds;

  return {
    allowed: true,
    remaining,
    resetSeconds,
  };
}

/**
 * Resets the rate limit for a key (e.g. after successful authentication or test teardown).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clears all rate limit records (useful for testing).
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Rate limit registration: max 5 requests per 15 minutes.
 */
export function rateLimitRegistration(identifier: string): RateLimitResult {
  return recordRateLimitHit(`reg:${identifier}`, 5, 15 * 60);
}

/**
 * Rate limit login: max 5 attempts per 15 minutes.
 */
export function rateLimitLogin(identifier: string): RateLimitResult {
  return recordRateLimitHit(`login:${identifier}`, 5, 15 * 60);
}

/**
 * Rate limit checkout: max 10 requests per minute.
 */
export function rateLimitCheckout(identifier: string): RateLimitResult {
  return recordRateLimitHit(`checkout:${identifier}`, 10, 60);
}
