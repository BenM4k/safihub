import "server-only";

import * as dal from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import {
  renderNotificationTemplate,
  sendNotification,
  type NotificationTemplateKey,
} from "@/services/notifications";
import {
  sendWhatsAppImageMessage,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppTemplateMessage,
  sendWhatsAppTextMessage,
} from "./client";
import { isCustomerServiceWindowOpen } from "./session";
import { formatCdfAmount, getBotCopy } from "./templates";
import type {
  BusinessSettlementWhatsAppInput,
  OrderStatusWhatsAppInput,
  WhatsAppSendResult,
} from "./types";

/**
 * Returns the sanitized application base URL for deep-linking.
 */
function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://safihub.com"
  ).replace(/\/$/, "");
}

/**
 * Dispatches an order status update notification over WhatsApp.
 * Automatically uses rich free-form messages when the 24-hour customer window is open,
 * and falls back to pre-approved Meta Utility Templates when out-of-window.
 */
export async function sendWhatsAppOrderStatusUpdate(
  input: OrderStatusWhatsAppInput
): Promise<Result<WhatsAppSendResult, string>> {
  if (!input.customerPhone?.trim()) {
    return err("Customer phone number is required");
  }

  // If this is a price adjustment, delegate to the interactive approval prompt
  if (input.status === "price_adjusted" && input.diffAmountCdf !== undefined) {
    return sendWhatsAppPriceAdjustmentPrompt({
      orderId: input.orderId,
      orderCode: input.orderCode,
      customerUserId: input.customerUserId,
      customerPhone: input.customerPhone,
      houseName: input.houseName || "Pressing Partenaire",
      diffAmountCdf: input.diffAmountCdf,
      reason: input.reason,
      locale: input.locale,
    });
  }

  const locale = input.locale ?? "fr";
  const trackingUrl = input.trackingToken
    ? `${getAppBaseUrl()}/track/${input.trackingToken}`
    : `${getAppBaseUrl()}/orders/${input.orderId}`;

  const rendered = renderNotificationTemplate(input.status, locale, {
    orderId: input.orderId,
    orderIdShort: input.orderCode,
    houseName: input.houseName || "Pressing Partenaire",
    courierName: input.courierName || "Coursier SafiHub",
    itemCount: input.itemCount ?? 0,
    amount:
      input.amountCdf !== undefined ? formatCdfAmount(input.amountCdf) : "",
    diffAmount:
      input.diffAmountCdf !== undefined
        ? formatCdfAmount(input.diffAmountCdf)
        : "",
    currency: "CDF",
    reason: input.reason || "",
    verificationCode: input.verificationCode || "",
    trackingUrl,
  });

  const trackingLabel =
    locale === "sw" ? "🔗 Ufuatiliaji" : locale === "en" ? "🔗 Tracking" : "🔗 Suivi";
  const fullBody = `🧺 *SafiHub — ${rendered.title}*\n\n${rendered.body}\n\n${trackingLabel} : ${trackingUrl}`;
  const inWindow = await isCustomerServiceWindowOpen(input.customerPhone);

  const waRes = inWindow
    ? await sendWhatsAppTextMessage({
        to: input.customerPhone,
        body: fullBody,
      })
    : await sendWhatsAppTemplateMessage({
        to: input.customerPhone,
        templateName: "safihub_order_status_update",
        localeCode: locale,
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: input.orderCode },
              { type: "text", text: rendered.title },
              { type: "text", text: rendered.body },
              { type: "text", text: trackingUrl },
            ],
          },
        ],
      });

  if (!waRes.ok) {
    return err(waRes.error);
  }

  await sendNotification({
    userId: input.customerUserId ?? null,
    phone: input.customerPhone,
    orderId: input.orderId,
    channel: "whatsapp_link",
    templateKey: input.status,
    locale,
    customTitle: rendered.title,
    customBody: fullBody,
  }).catch(() => {});

  return ok(waRes.value);
}

/**
 * Looks up an order by ID on the server and dispatches a WhatsApp status notification
 * to the customer without exposing customer PII to house projections.
 */
export async function notifyOrderStatusOnWhatsAppById(params: {
  orderId: string;
  status: NotificationTemplateKey;
  courierName?: string;
  diffAmountCdf?: number;
  itemCount?: number;
  reason?: string;
  verificationCode?: string | null;
  locale?: "fr" | "sw" | "en";
}): Promise<Result<WhatsAppSendResult, string>> {
  try {
    if (!("getOrderById" in dal) || typeof dal.getOrderById !== "function") {
      return err("getOrderById unavailable");
    }
    const order = await dal.getOrderById(params.orderId);
    if (!order || !order.customerPhone) {
      return err("Order or customer phone not found");
    }

    return sendWhatsAppOrderStatusUpdate({
      orderId: order.id,
      orderCode: order.code,
      trackingToken: order.trackingToken,
      customerUserId: order.customerId,
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      houseName: order.houseName,
      courierName: params.courierName,
      status: params.status,
      amountCdf: order.totalDue,
      diffAmountCdf: params.diffAmountCdf,
      itemCount: params.itemCount,
      reason: params.reason,
      verificationCode:
        params.verificationCode ?? order.deliveryConfirmationCode ?? null,
      locale: params.locale,
    });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Failed to notify order status on WhatsApp"
    );
  }
}

/**
 * Dispatches a real-time courier arrival alert (pickup or delivery) to the customer.
 * Includes the 4-digit delivery verification code when arriving for delivery.
 */
export async function sendWhatsAppCourierArrivalAlert(params: {
  orderId: string;
  orderCode: string;
  customerUserId?: string | null;
  customerPhone: string;
  courierName: string;
  leg: "pickup" | "delivery";
  verificationCode?: string | null;
  trackingToken?: string | null;
  locale?: "fr" | "sw" | "en";
}): Promise<Result<WhatsAppSendResult, string>> {
  const templateKey =
    params.leg === "delivery" ? "delivery_arrived" : "pickup_arrived";

  return sendWhatsAppOrderStatusUpdate({
    orderId: params.orderId,
    orderCode: params.orderCode,
    trackingToken: params.trackingToken,
    customerUserId: params.customerUserId,
    customerPhone: params.customerPhone,
    courierName: params.courierName,
    status: templateKey,
    verificationCode: params.verificationCode ?? "----",
    locale: params.locale,
  });
}

/**
 * Sends an interactive 2-button WhatsApp prompt to the customer when a 3-point count
 * or fabric discrepancy triggers a price adjustment (Domain Invariant #5).
 */
export async function sendWhatsAppPriceAdjustmentPrompt(params: {
  orderId: string;
  orderCode: string;
  customerUserId?: string | null;
  customerPhone: string;
  houseName: string;
  diffAmountCdf: number;
  reason?: string;
  locale?: "fr" | "sw" | "en";
}): Promise<Result<WhatsAppSendResult, string>> {
  if (!params.customerPhone?.trim()) {
    return err("Customer phone number is required");
  }

  const locale = params.locale ?? "fr";
  const copy = getBotCopy(locale);
  const diffFormatted = formatCdfAmount(params.diffAmountCdf);

  const bodyText = copy.priceAdjustmentPromptBody({
    orderCode: params.orderCode,
    houseName: params.houseName,
    diffAmountCdf: diffFormatted,
    reason: params.reason,
  });

  const inWindow = await isCustomerServiceWindowOpen(params.customerPhone);
  const waRes = inWindow
    ? await sendWhatsAppInteractiveButtons({
        to: params.customerPhone,
        headerText: "SafiHub Bukavu",
        bodyText,
        buttons: [
          {
            id: `ADJUSTMENT_APPROVE:${params.orderId}`,
            title: copy.btnApproveAdjustment,
          },
          {
            id: `ADJUSTMENT_REJECT:${params.orderId}`,
            title: copy.btnRejectAdjustment,
          },
        ],
      })
    : await sendWhatsAppTemplateMessage({
        to: params.customerPhone,
        templateName: "safihub_price_adjustment_prompt",
        localeCode: locale,
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: params.orderCode },
              { type: "text", text: params.houseName },
              { type: "text", text: diffFormatted },
            ],
          },
          {
            type: "button",
            sub_type: "quick_reply",
            index: 0,
            parameters: [
              {
                type: "payload",
                payload: `ADJUSTMENT_APPROVE:${params.orderId}`,
              },
            ],
          },
          {
            type: "button",
            sub_type: "quick_reply",
            index: 1,
            parameters: [
              {
                type: "payload",
                payload: `ADJUSTMENT_REJECT:${params.orderId}`,
              },
            ],
          },
        ],
      });

  if (!waRes.ok) {
    return err(waRes.error);
  }

  await sendNotification({
    userId: params.customerUserId ?? null,
    phone: params.customerPhone,
    orderId: params.orderId,
    channel: "whatsapp_link",
    templateKey: "price_adjusted",
    locale,
    params: {
      orderIdShort: params.orderCode,
      diffAmount: params.diffAmountCdf,
      currency: "CDF",
    },
    customBody: bodyText,
  }).catch(() => {});

  return ok(waRes.value);
}

/**
 * Sends a payment / settlement received notification to a partner laundry house.
 * Strictly respects the Customer Privacy Firewall (no customer PII included).
 */
export async function sendWhatsAppBusinessSettlementNotice(
  input: BusinessSettlementWhatsAppInput
): Promise<Result<WhatsAppSendResult, string>> {
  if (!input.contactPhone?.trim()) {
    return err("Laundry house contact phone is required");
  }

  const locale = input.locale ?? "fr";
  const formattedAmount =
    input.currency === "CDF"
      ? formatCdfAmount(input.amount)
      : `${input.amount} USD`;
  const reference = input.reference || "CASH";

  const rendered = renderNotificationTemplate(
    "partner_settlement_paid",
    locale,
    {
      houseName: input.houseName,
      amount: input.amount.toLocaleString("fr-CD"),
      currency: input.currency,
      reference,
    }
  );

  const inWindow = await isCustomerServiceWindowOpen(input.contactPhone);
  const periodLabel =
    locale === "sw" ? "Kipindi" : locale === "en" ? "Period" : "Période";
  const body = `💵 *${rendered.title}*\n\n${rendered.body}${
    input.period ? `\n📅 ${periodLabel} : ${input.period}` : ""
  }`;

  const waRes = inWindow
    ? await sendWhatsAppTextMessage({
        to: input.contactPhone,
        body,
      })
    : await sendWhatsAppTemplateMessage({
        to: input.contactPhone,
        templateName: "safihub_partner_settlement_paid",
        localeCode: locale,
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: input.houseName },
              { type: "text", text: formattedAmount },
              { type: "text", text: reference },
            ],
          },
        ],
      });

  if (!waRes.ok) {
    return err(waRes.error);
  }

  await sendNotification({
    phone: input.contactPhone,
    channel: "whatsapp_link",
    templateKey: "partner_settlement_paid",
    locale,
    customTitle: rendered.title,
    customBody: body,
  }).catch(() => {});

  return ok(waRes.value);
}

/**
 * Forwards a Cloudflare R2 condition or delivery proof photo to the customer on WhatsApp.
 */
export async function sendWhatsAppConditionPhotoProof(params: {
  orderId: string;
  orderCode: string;
  customerPhone: string;
  imageUrl: string;
  caption?: string;
  locale?: "fr" | "sw" | "en";
}): Promise<Result<WhatsAppSendResult, string>> {
  if (!params.customerPhone?.trim()) {
    return err("Customer phone number is required");
  }
  if (!params.imageUrl?.trim()) {
    return err("Image URL is required");
  }

  const locale = params.locale ?? "fr";
  const defaultCaption =
    locale === "sw"
      ? `📸 SafiHub — Picha ya ukaguzi ya agizo lako #${params.orderCode}`
      : locale === "en"
        ? `📸 SafiHub — Inspection photo for your order #${params.orderCode}`
        : `📸 SafiHub — Photo de contrôle pour votre commande #${params.orderCode}`;

  return sendWhatsAppImageMessage({
    to: params.customerPhone,
    imageUrl: params.imageUrl,
    caption: params.caption || defaultCaption,
  });
}
