import "server-only";

import crypto from "crypto";
import { err, ok, type Result } from "@/lib/result";

/**
 * Verifies the Meta Webhook GET subscription challenge.
 */
export function verifyWhatsAppWebhookChallenge(params: {
  mode: string | null;
  token: string | null;
  challenge: string | null;
  verifyToken?: string;
}): Result<string, string> {
  const configuredToken = params.verifyToken ?? process.env.WHATSAPP_VERIFY_TOKEN;

  if (!configuredToken) {
    return err("WHATSAPP_VERIFY_TOKEN is not configured");
  }

  if (params.mode !== "subscribe") {
    return err("Invalid hub.mode");
  }

  if (!params.token || params.token !== configuredToken) {
    return err("Invalid hub.verify_token");
  }

  if (!params.challenge) {
    return err("Missing hub.challenge");
  }

  return ok(params.challenge);
}

/**
 * Verifies the Meta Webhook POST `x-hub-signature-256` HMAC-SHA256 header.
 * Uses constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
 */
export function verifyWhatsAppWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
  appSecret?: string
): boolean {
  const secret = appSecret ?? process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) {
    return false;
  }

  const [prefix, signatureHash] = signatureHeader.split("=");
  if (prefix !== "sha256" || !signatureHash) {
    return false;
  }

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signatureHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

