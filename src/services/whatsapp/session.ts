import "server-only";

import { Redis } from "@upstash/redis";
import { normalizeWhatsAppPhone } from "./client";
import type { WhatsAppBotSession } from "./types";

const SESSION_TTL_SECONDS = 30 * 60; // 30 minutes
const DEDUPE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const CUSTOMER_WINDOW_TTL_SECONDS = 24 * 60 * 60; // 24 hours

let redisClient: Redis | null | undefined;

function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test";
}

function getRedis(): Redis | null {
  if (isTestEnv()) return null;
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

// In-memory store with expiration for test/local fallback
interface MemoryEntry<T> {
  value: T;
  expiresAt: number;
}

const memorySessions = new Map<string, MemoryEntry<WhatsAppBotSession>>();
const memoryDedupe = new Map<string, number>();
const memoryWindows = new Map<string, number>();

function createDefaultSession(phone: string): WhatsAppBotSession {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  return {
    phone: normalizedPhone,
    locale: "fr",
    step: "IDLE",
    items: [],
    updatedAt: Date.now(),
  };
}

/**
 * Retrieves or initializes a conversational bot session for a phone number.
 */
export async function getWhatsAppBotSession(
  phone: string
): Promise<WhatsAppBotSession> {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  const key = `safihub:wa:session:${normalizedPhone}`;

  const redis = getRedis();
  if (redis) {
    try {
      const existing = await redis.get<WhatsAppBotSession>(key);
      if (existing) {
        return existing;
      }
    } catch {
      // Fall back to memory store on transient Redis failure
    }
  }

  const mem = memorySessions.get(key);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.value;
  }

  return createDefaultSession(normalizedPhone);
}

/**
 * Saves the conversational bot session with a 30-minute sliding TTL.
 */
export async function saveWhatsAppBotSession(
  session: WhatsAppBotSession
): Promise<void> {
  const normalizedPhone = normalizeWhatsAppPhone(session.phone);
  const key = `safihub:wa:session:${normalizedPhone}`;
  const updated: WhatsAppBotSession = {
    ...session,
    phone: normalizedPhone,
    updatedAt: Date.now(),
  };

  memorySessions.set(key, {
    value: updated,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });

  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key, updated, { ex: SESSION_TTL_SECONDS });
    } catch {
      // Ignore Redis write error; memory fallback updated
    }
  }
}

/**
 * Resets a user's bot session to IDLE while preserving their chosen locale and name.
 */
export async function clearWhatsAppBotSession(phone: string): Promise<void> {
  const current = await getWhatsAppBotSession(phone);
  const reset: WhatsAppBotSession = {
    phone: current.phone,
    customerName: current.customerName,
    locale: current.locale,
    step: "IDLE",
    items: [],
    updatedAt: Date.now(),
  };
  await saveWhatsAppBotSession(reset);
}

/**
 * Deduplicates incoming WhatsApp webhook messages by WAMID.
 * Returns `true` if this message ID has already been processed, `false` if it is new (and marks it processed).
 */
export async function claimInboundWhatsAppMessage(
  wamid: string
): Promise<boolean> {
  if (!wamid) return false;
  const key = `safihub:wa:wamid:${wamid}`;

  const now = Date.now();
  const existingMemExpiry = memoryDedupe.get(key);
  if (existingMemExpiry && existingMemExpiry > now) {
    return false; // Already processed
  }
  memoryDedupe.set(key, now + DEDUPE_TTL_SECONDS * 1000);

  const redis = getRedis();
  if (redis) {
    try {
      const setRes = await redis.set(key, "1", {
        nx: true,
        ex: DEDUPE_TTL_SECONDS,
      });
      return setRes === "OK";
    } catch {
      return true;
    }
  }

  return true;
}

/**
 * Records that a customer sent an inbound message, opening the 24-hour WhatsApp Customer Service Window.
 */
export async function recordCustomerServiceWindowOpen(
  phone: string
): Promise<void> {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return;
  const key = `safihub:wa:window:${normalizedPhone}`;
  const expiresAt = Date.now() + CUSTOMER_WINDOW_TTL_SECONDS * 1000;

  memoryWindows.set(key, expiresAt);

  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key, expiresAt, { ex: CUSTOMER_WINDOW_TTL_SECONDS });
    } catch {
      // Ignore transient Redis error
    }
  }
}

/**
 * Checks whether the 24-hour WhatsApp Customer Service Window is currently open for a phone number.
 */
export async function isCustomerServiceWindowOpen(
  phone: string
): Promise<boolean> {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return false;
  const key = `safihub:wa:window:${normalizedPhone}`;

  const redis = getRedis();
  if (redis) {
    try {
      const val = await redis.get<number>(key);
      if (val && val > Date.now()) {
        return true;
      }
    } catch {
      // Fall back to memory check
    }
  }

  const memExpiry = memoryWindows.get(key);
  return Boolean(memExpiry && memExpiry > Date.now());
}

/**
 * Clears in-memory WhatsApp session and deduplication stores (for unit tests).
 */
export function clearWhatsAppMemoryStores(): void {
  memorySessions.clear();
  memoryDedupe.clear();
  memoryWindows.clear();
}

