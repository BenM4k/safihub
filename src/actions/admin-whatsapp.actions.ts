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
  .min(8, "Un numéro de téléphone WhatsApp valide est requis")
  .max(24, "Numéro de téléphone trop long")
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "Numéro de téléphone WhatsApp invalide (8 à 15 chiffres attendus)");

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
    return err("Trop de tests WhatsApp envoyés. Veuillez patienter une minute.");
  }

  const parsed = sendTestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
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
    return err("Trop de simulations effectuées. Veuillez patienter une minute.");
  }

  const parsed = simulateBotSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  return simulateAdminWhatsAppBotStep(parsed.data);
}

