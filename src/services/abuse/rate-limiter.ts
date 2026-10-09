import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Deployment-wide sliding-window rate limiting backed by Upstash Redis, so
 * limits hold across Vercel instances and cold starts.
 *
 * - NODE_ENV === "test": deterministic in-memory store (no network).
 * - Upstash configured: shared Redis store.
 * - Not configured / Redis error: fail open (logged) so auth & checkout stay
 *   available; configure UPSTASH_REDIS_REST_URL/TOKEN in every deployed env.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

const isTestEnv = (): boolean => process.env.NODE_ENV === "test";

// ---------------------------------------------------------------------------
// Upstash backend
// ---------------------------------------------------------------------------

let redisClient: Redis | null | undefined;
const limiters = new Map<string, Ratelimit>();
let warnedUnconfigured = false;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

function getLimiter(redis: Redis, maxRequests: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${maxRequests}:${windowSeconds}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      prefix: "safihub:ratelimit",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

function failOpen(maxRequests: number, windowSeconds: number): RateLimitResult {
  return { allowed: true, remaining: maxRequests, resetSeconds: windowSeconds };
}

// ---------------------------------------------------------------------------
// In-memory backend (tests only)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, number[]>();

function recordInMemory(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (memoryStore.get(key) ?? []).filter((ts) => now - ts < windowMs);

  if (timestamps.length >= maxRequests) {
    memoryStore.set(key, timestamps);
    const oldest = timestamps[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - timestamps.length),
    resetSeconds: windowSeconds,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks and records an attempt for a given rate limit key using a sliding window.
 */
export async function recordRateLimitHit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (isTestEnv()) return recordInMemory(key, maxRequests, windowSeconds);

  const redis = getRedis();
  if (!redis) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.error("[rate-limiter] UPSTASH_REDIS_REST_URL/TOKEN not set; rate limiting disabled.");
    }
    return failOpen(maxRequests, windowSeconds);
  }

  try {
    const res = await getLimiter(redis, maxRequests, windowSeconds).limit(key);
    return {
      allowed: res.success,
      remaining: Math.max(0, res.remaining),
      resetSeconds: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[rate-limiter] Upstash error; failing open.", error);
    return failOpen(maxRequests, windowSeconds);
  }
}

/**
 * Resets the rate limit for a key (e.g. after successful authentication or test teardown).
 */
export async function resetRateLimit(key: string): Promise<void> {
  memoryStore.delete(key);
  if (isTestEnv()) return;
  await Promise.all([...limiters.values()].map((l) => l.resetUsedTokens(key).catch(() => {})));
}

/**
 * Clears all in-memory rate limit records (tests only).
 */
export function clearRateLimitStore(): void {
  memoryStore.clear();
}

/**
 * Rate limit registration: max 5 requests per 15 minutes.
 */
export function rateLimitRegistration(identifier: string): Promise<RateLimitResult> {
  return recordRateLimitHit(`reg:${identifier}`, 5, 15 * 60);
}

/**
 * Rate limit login: max 5 attempts per 15 minutes.
 */
export function rateLimitLogin(identifier: string): Promise<RateLimitResult> {
  return recordRateLimitHit(`login:${identifier}`, 5, 15 * 60);
}

/**
 * Rate limit checkout: max 10 requests per minute.
 */
export function rateLimitCheckout(identifier: string): Promise<RateLimitResult> {
  return recordRateLimitHit(`checkout:${identifier}`, 10, 60);
}
