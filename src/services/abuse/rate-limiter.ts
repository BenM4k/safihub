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
  unavailable?: boolean;
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

function failClosed(windowSeconds: number): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetSeconds: windowSeconds,
    unavailable: true,
  };
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

function checkInMemory(key: string, maxRequests: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (memoryStore.get(key) ?? []).filter((ts) => now - ts < windowMs);
  memoryStore.set(key, timestamps);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

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
 * Checks the remaining rate limit budget without consuming an attempt.
 */
export async function checkRateLimitStatus(
  key: string,
  maxRequests: number,
  windowSeconds: number,
  options?: { failClosed?: boolean }
): Promise<RateLimitResult> {
  if (isTestEnv()) return checkInMemory(key, maxRequests, windowSeconds);

  const redis = getRedis();
  if (!redis) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.error("[rate-limiter] UPSTASH_REDIS_REST_URL/TOKEN not set; rate limiting disabled.");
    }
    return options?.failClosed
      ? failClosed(windowSeconds)
      : failOpen(maxRequests, windowSeconds);
  }

  try {
    const res = await getLimiter(redis, maxRequests, windowSeconds).getRemaining(key);
    return {
      allowed: res.remaining > 0,
      remaining: Math.max(0, res.remaining),
      resetSeconds: res.reset
        ? Math.max(1, Math.ceil((res.reset - Date.now()) / 1000))
        : windowSeconds,
    };
  } catch (error) {
    console.error("[rate-limiter] Upstash error during getRemaining.", error);
    return options?.failClosed
      ? failClosed(windowSeconds)
      : failOpen(maxRequests, windowSeconds);
  }
}

/**
 * Checks and records an attempt for a given rate limit key using a sliding window.
 */
export async function recordRateLimitHit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
  options?: { failClosed?: boolean }
): Promise<RateLimitResult> {
  if (isTestEnv()) return recordInMemory(key, maxRequests, windowSeconds);

  const redis = getRedis();
  if (!redis) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.error("[rate-limiter] UPSTASH_REDIS_REST_URL/TOKEN not set; rate limiting disabled.");
    }
    return options?.failClosed
      ? failClosed(windowSeconds)
      : failOpen(maxRequests, windowSeconds);
  }

  try {
    const res = await getLimiter(redis, maxRequests, windowSeconds).limit(key);
    return {
      allowed: res.success,
      remaining: Math.max(0, res.remaining),
      resetSeconds: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[rate-limiter] Upstash error.", error);
    return options?.failClosed
      ? failClosed(windowSeconds)
      : failOpen(maxRequests, windowSeconds);
  }
}

/**
 * Resets the sliding window counter for a given key and window definition.
 */
export async function resetRateLimitKey(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<void> {
  if (isTestEnv()) {
    memoryStore.delete(key);
    return;
  }

  const redis = getRedis();
  if (!redis) return;

  try {
    await getLimiter(redis, maxRequests, windowSeconds).resetUsedTokens(key);
  } catch (error) {
    console.error("[rate-limiter] Upstash error during resetUsedTokens.", error);
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

/**
 * Rate limit partner application submissions: max 3 requests per 30 minutes.
 */
export function rateLimitPartnerApplication(
  identifier: string
): Promise<RateLimitResult> {
  return recordRateLimitHit(`partner_app:${identifier}`, 3, 30 * 60);
}

/**
 * Rate limit password changes: max 5 requests per 15 minutes.
 */
export function rateLimitPasswordChange(
  identifier: string
): Promise<RateLimitResult> {
  return recordRateLimitHit(`pwd_change:${identifier}`, 5, 15 * 60);
}

const DELIVERY_CODE_MAX_ATTEMPTS = 5;
const DELIVERY_CODE_WINDOW_SECONDS = 15 * 60;

function deliveryCodeRateLimitKey(courierId: string, missionId: string): string {
  return `delivery-code:${courierId}:${missionId}`;
}

/**
 * Checks delivery confirmation code verification budget without consuming an attempt.
 * Fails closed when Redis is unavailable outside tests to preserve brute-force protection.
 */
export function checkDeliveryCodeVerificationRateLimit(
  courierId: string,
  missionId: string
): Promise<RateLimitResult> {
  return checkRateLimitStatus(
    deliveryCodeRateLimitKey(courierId, missionId),
    DELIVERY_CODE_MAX_ATTEMPTS,
    DELIVERY_CODE_WINDOW_SECONDS,
    { failClosed: true }
  );
}

/**
 * Consumes one delivery confirmation code verification attempt (used only on wrong code).
 */
export function recordFailedDeliveryCodeAttempt(
  courierId: string,
  missionId: string
): Promise<RateLimitResult> {
  return recordRateLimitHit(
    deliveryCodeRateLimitKey(courierId, missionId),
    DELIVERY_CODE_MAX_ATTEMPTS,
    DELIVERY_CODE_WINDOW_SECONDS,
    { failClosed: true }
  );
}

/**
 * Clears delivery confirmation code attempts after successful verification.
 */
export function clearDeliveryCodeVerificationRateLimit(
  courierId: string,
  missionId: string
): Promise<void> {
  return resetRateLimitKey(
    deliveryCodeRateLimitKey(courierId, missionId),
    DELIVERY_CODE_MAX_ATTEMPTS,
    DELIVERY_CODE_WINDOW_SECONDS
  );
}

/**
 * Rate limit delivery confirmation code attempts: max 5 attempts per 15 minutes per courier + mission.
 */
export function rateLimitDeliveryCodeVerification(
  courierId: string,
  missionId: string
): Promise<RateLimitResult> {
  return recordFailedDeliveryCodeAttempt(courierId, missionId);
}

