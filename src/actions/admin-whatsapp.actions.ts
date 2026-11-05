"use server";

import { z } from "zod";
import { err, type Result } from "@/lib/result";
import { requireRole } from "@/services/auth";
import {
  executeAdminWhatsAppTest,
  simulateAdminWhatsAppBotStep,
  type ExecuteWhatsAppTestResult,
  type WhatsAppBotSession,
} from "@/services/whatsapp";

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
  recipientPhone: z
    .string()
    .min(8, "Un numéro de téléphone WhatsApp valide est requis"),
  locale: z.enum(["fr", "sw", "en"]).default("fr"),
  customText: z.string().optional(),
  orderCode: z.string().optional(),
  houseName: z.string().optional(),
  courierName: z.string().optional(),
  amountCdf: z.coerce.number().int().min(0).optional(),
  verificationCode: z.string().optional(),
});

const simulateBotSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone requis"),
  actionType: z.enum(["text", "button", "list", "location", "reset"]),
  value: z.string().optional(),
});

/**
 * Server action allowing administrators to send test WhatsApp messages via the Cloud API.
 */
export async function sendAdminWhatsAppTestAction(
  rawInput: z.infer<typeof sendTestSchema>
): Promise<Result<ExecuteWhatsAppTestResult, string>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

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
  rawInput: z.infer<typeof simulateBotSchema>
): Promise<Result<WhatsAppBotSession, string>> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return err(auth.error);

  const parsed = simulateBotSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Paramètres invalides");
  }

  return simulateAdminWhatsAppBotStep(parsed.data);
}

