"use server";

import { z } from "zod";
import { err, type Result } from "@/lib/result";
import { requireRole } from "@/services/auth";
import { recordRateLimitHit } from "@/services/abuse/rate-limiter";
import {
  executeAdminWhatsAppTest,
  simulateAdminWhatsAppBotStep,
  type ExecuteWhatsAppTestResult,
  type WhatsAppBotSession,
} from "@/services/whatsapp";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "errors.phoneRequired")
  .max(24, "errors.phoneTooLong")
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "errors.phoneInvalid");

const sendTestSchema = z.object({
  scenario: z.enum([
    "hello_world_template",
    "free_text",
    "order_status",
    "courier_arrival",
    "price_adjustment",
    "partner_settlement",
    "bot_welcome",
  ]),
  recipientPhone: phoneSchema,
  locale: z.enum(["fr", "sw", "en"]).default("fr"),
  customText: z.string().trim().max(1000).optional(),
  orderCode: z.string().trim().max(100).optional(),
  houseName: z.string().trim().max(100).optional(),
  courierName: z.string().trim().max(100).optional(),
  amountCdf: z.coerce.number().int().min(0).max(100_000_000).optional(),
  verificationCode: z.string().trim().max(20).optional(),
  dryRun: z.boolean().default(true),
});

const simulateBotSchema = z.object({
  phone: phoneSchema,
  actionType: z.enum(["text", "button", "list", "location", "reset"]),
  value: z.string().trim().max(500).optional(),
  dryRun: z.boolean().default(true),
});

/**
 * Server action allowing administrators to send test WhatsApp messages via the Cloud API.
 */
export async function sendAdminWhatsAppTestAction(
  rawInput: z.input<typeof sendTestSchema>
): Promise<Result<ExecuteWhatsAppTestResult, string>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rl = await recordRateLimitHit(`admin-wa-test:${auth.value.user.id}`, 15, 60);
  if (!rl.allowed) {
    return err("errors.rateLimitSend");
  }

  const parsed = sendTestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "errors.invalidParams");
  }

  return executeAdminWhatsAppTest(parsed.data);
}

/**
 * Server action allowing administrators to simulate inbound WhatsApp conversational bot steps.
 */
export async function simulateAdminWhatsAppBotStepAction(
  rawInput: z.input<typeof simulateBotSchema>
): Promise<Result<WhatsAppBotSession, string>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const rl = await recordRateLimitHit(`admin-wa-sim:${auth.value.user.id}`, 30, 60);
  if (!rl.allowed) {
    return err("errors.rateLimitSimulate");
  }

  const parsed = simulateBotSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "errors.invalidParams");
  }

  return simulateAdminWhatsAppBotStep(parsed.data);
}

