import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  normalizeWhatsAppPhone,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppTemplateMessage,
  sendWhatsAppTextMessage,
} from "./client";
import { handleInboundWhatsAppMessage } from "./bot";
import {
  sendWhatsAppBusinessSettlementNotice,
  sendWhatsAppCourierArrivalAlert,
  sendWhatsAppOrderStatusUpdate,
  sendWhatsAppPriceAdjustmentPrompt,
} from "./notifications";
import {
  clearWhatsAppBotSession,
  getWhatsAppBotSession,
  recordCustomerServiceWindowOpen,
} from "./session";
import { getBotCopy } from "./templates";
import type {
  WhatsAppBotSession,
  WhatsAppLocale,
  WhatsAppSendResult,
} from "./types";

export type WhatsAppTestScenario =
  | "hello_world_template"
  | "free_text"
  | "order_status"
  | "courier_arrival"
  | "price_adjustment"
  | "partner_settlement"
  | "bot_welcome";

export interface WhatsAppIntegrationStatus {
  isConfigured: boolean;
  apiVersion: string;
  phoneNumberIdMasked: string | null;
  wabaIdMasked: string | null;
  hasAccessToken: boolean;
  hasVerifyToken: boolean;
  hasAppSecret: boolean;
  webhookUrl: string;
}

export interface ExecuteWhatsAppTestInput {
  scenario: WhatsAppTestScenario;
  recipientPhone: string;
  locale: WhatsAppLocale;
  customText?: string;
  orderCode?: string;
  houseName?: string;
  courierName?: string;
  amountCdf?: number;
  verificationCode?: string;
}

export interface ExecuteWhatsAppTestResult extends WhatsAppSendResult {
  scenario: WhatsAppTestScenario;
  sentAtIso: string;
}

/**
 * Masks sensitive identifiers to display in administrative screens safely.
 */
function maskIdentifier(val: string | undefined): string | null {
  if (!val || !val.trim()) return null;
  const trimmed = val.trim();
  if (trimmed.length <= 6) return trimmed;
  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`;
}

/**
 * Returns the current server-side WhatsApp Cloud API configuration status for the admin console.
 */
export function getWhatsAppIntegrationStatus(): WhatsAppIntegrationStatus {
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v23.0";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_WABA_ID;
  const hasAccessToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN?.trim());
  const hasVerifyToken = Boolean(process.env.WHATSAPP_VERIFY_TOKEN?.trim());
  const hasAppSecret = Boolean(process.env.WHATSAPP_APP_SECRET?.trim());
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    isConfigured: Boolean(phoneId?.trim() && hasAccessToken),
    apiVersion,
    phoneNumberIdMasked: maskIdentifier(phoneId),
    wabaIdMasked: maskIdentifier(wabaId),
    hasAccessToken,
    hasVerifyToken,
    hasAppSecret,
    webhookUrl: `${baseUrl}/api/webhooks/whatsapp`,
  };
}

/**
 * Executes an admin WhatsApp test scenario and returns the Graph API delivery result.
 */
export async function executeAdminWhatsAppTest(
  input: ExecuteWhatsAppTestInput
): Promise<Result<ExecuteWhatsAppTestResult, string>> {
  const normalizedPhone = normalizeWhatsAppPhone(input.recipientPhone);
  if (!normalizedPhone || normalizedPhone.length < 8) {
    return err("Numéro de téléphone WhatsApp invalide");
  }

  const locale = input.locale || "fr";
  const orderCode = input.orderCode?.trim() || "ORD-20261105-4821";
  const houseName = input.houseName?.trim() || "Pressing Rafiki";
  const courierName = input.courierName?.trim() || "Justin";
  const amountCdf = input.amountCdf ?? 25000;
  const verificationCode = input.verificationCode?.trim() || "4821";

  // Open the 24h customer window in session cache so non-template test scenarios can be tested seamlessly
  if (input.scenario !== "hello_world_template") {
    await recordCustomerServiceWindowOpen(normalizedPhone);
  }

  let res: Result<WhatsAppSendResult, string>;

  switch (input.scenario) {
    case "hello_world_template": {
      res = await sendWhatsAppTemplateMessage({
        to: normalizedPhone,
        templateName: "hello_world",
        localeCode: "en_US",
      });
      break;
    }

    case "free_text": {
      const body =
        input.customText?.trim() ||
        "🧺 SafiHub Bukavu : Message de test depuis la console d'administration.";
      res = await sendWhatsAppTextMessage({
        to: normalizedPhone,
        body,
      });
      break;
    }

    case "order_status": {
      res = await sendWhatsAppOrderStatusUpdate({
        orderId: "00000000-0000-0000-0000-000000000001",
        orderCode,
        trackingToken: "test-track-token",
        customerPhone: normalizedPhone,
        houseName,
        status: "order_accepted",
        amountCdf,
        locale,
      });
      break;
    }

    case "courier_arrival": {
      res = await sendWhatsAppCourierArrivalAlert({
        orderId: "00000000-0000-0000-0000-000000000001",
        orderCode,
        customerPhone: normalizedPhone,
        courierName,
        leg: "delivery",
        verificationCode,
        trackingToken: "test-track-token",
        locale,
      });
      break;
    }

    case "price_adjustment": {
      res = await sendWhatsAppPriceAdjustmentPrompt({
        orderId: "00000000-0000-0000-0000-000000000001",
        orderCode,
        customerPhone: normalizedPhone,
        houseName,
        diffAmountCdf: amountCdf,
        reason: input.customText?.trim() || "2 articles supplémentaires au comptage",
        locale,
      });
      break;
    }

    case "partner_settlement": {
      res = await sendWhatsAppBusinessSettlementNotice({
        houseId: "00000000-0000-0000-0000-000000000002",
        houseName,
        contactPhone: normalizedPhone,
        amount: amountCdf,
        currency: "CDF",
        reference: `STL-${orderCode.slice(-4)}`,
        method: "mobile_money",
        period: "2026-W45",
        locale,
      });
      break;
    }

    case "bot_welcome": {
      const copy = getBotCopy(locale);
      const toggleLocale: WhatsAppLocale = locale === "sw" ? "fr" : "sw";
      const toggleLabel =
        locale === "sw" ? copy.btnLanguageFr : copy.btnLanguageSw;

      res = await sendWhatsAppInteractiveButtons({
        to: normalizedPhone,
        headerText: copy.welcomeHeader,
        bodyText: copy.welcomeBody,
        buttons: [
          { id: "START_ORDER", title: copy.btnStartOrder },
          { id: `SET_LOCALE:${toggleLocale}`, title: toggleLabel },
        ],
      });
      break;
    }

    default:
      return err("Scénario de test inconnu");
  }

  if (!res.ok) {
    return err(res.error);
  }

  return ok({
    ...res.value,
    scenario: input.scenario,
    sentAtIso: new Date().toISOString(),
  });
}

/**
 * Simulates an inbound message to the WhatsApp conversational bot and returns the resulting session state.
 */
export async function simulateAdminWhatsAppBotStep(params: {
  phone: string;
  actionType: "text" | "button" | "list" | "location" | "reset";
  value?: string;
}): Promise<Result<WhatsAppBotSession, string>> {
  const normalizedPhone = normalizeWhatsAppPhone(params.phone);
  if (!normalizedPhone || normalizedPhone.length < 8) {
    return err("Numéro de téléphone invalide");
  }

  if (params.actionType === "reset") {
    await clearWhatsAppBotSession(normalizedPhone);
    const session = await getWhatsAppBotSession(normalizedPhone);
    return ok(session);
  }

  const wamid = `wamid.sim_${crypto.randomUUID()}`;

  if (params.actionType === "location") {
    const res = await handleInboundWhatsAppMessage({
      message: {
        id: wamid,
        from: normalizedPhone,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "location",
        location: {
          latitude: -2.5021,
          longitude: 28.8642,
          name: "Avenue Gouverneur",
          address: params.value?.trim() || "La Botte, Bukavu",
        },
      },
      contactName: "Admin Test",
    });
    if (!res.ok) return err(res.error);
  } else if (params.actionType === "button") {
    const res = await handleInboundWhatsAppMessage({
      message: {
        id: wamid,
        from: normalizedPhone,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "interactive",
        interactive: {
          type: "button_reply",
          button_reply: {
            id: params.value || "START_ORDER",
            title: params.value || "START_ORDER",
          },
        },
      },
      contactName: "Admin Test",
    });
    if (!res.ok) return err(res.error);
  } else if (params.actionType === "list") {
    const res = await handleInboundWhatsAppMessage({
      message: {
        id: wamid,
        from: normalizedPhone,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "interactive",
        interactive: {
          type: "list_reply",
          list_reply: {
            id: params.value || "",
            title: params.value || "",
          },
        },
      },
      contactName: "Admin Test",
    });
    if (!res.ok) return err(res.error);
  } else {
    const res = await handleInboundWhatsAppMessage({
      message: {
        id: wamid,
        from: normalizedPhone,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "text",
        text: {
          body: params.value?.trim() || "Bonjour",
        },
      },
      contactName: "Admin Test",
    });
    if (!res.ok) return err(res.error);
  }

  const updatedSession = await getWhatsAppBotSession(normalizedPhone);
  return ok(updatedSession);
}

