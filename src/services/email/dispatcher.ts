import "server-only";
import { inngest } from "@/inngest/client";
import type { EmailNotificationJobPayload } from "@/inngest/functions/email-notifications";
import {
  sendHouseSettlementEmail,
  sendHouseStaffLinkedEmail,
  sendHouseStatusChangeEmail,
  sendOrderAdjustmentPromptEmail,
  sendOrderConfirmationEmail,
  sendOrderDeliveredReceiptEmail,
  sendPartnerApplicationReceivedEmail,
  sendPartnerInvitationEmail,
  sendPartnerRejectionEmail,
} from "./index";

/**
 * Constructs a deterministic 24-hour idempotency key for Inngest event deduplication.
 * Ensures that retries of identical operations do not generate duplicate emails.
 */
export function buildIdempotentEmailKey(payload: EmailNotificationJobPayload): string {
  switch (payload.kind) {
    case "order_confirmation":
      return `email-order-confirmation-${payload.orderId}`;
    case "order_adjustment_prompt":
      return `email-order-adj-${payload.orderId}-${payload.diffAmountCdf}`;
    case "order_delivered_receipt":
      return `email-order-delivered-${payload.orderId}`;
    case "partner_application_received":
      return `email-partner-app-received-${payload.applicationId}`;
    case "partner_application_approved":
      return `email-partner-app-approved-${payload.applicationId}`;
    case "partner_application_rejected":
      return `email-partner-app-rejected-${payload.applicationId}`;
    case "house_status_changed":
      return `email-house-status-${payload.houseId}-${payload.email}-${payload.eventId || (payload.isActive ? "active" : "inactive")}`;
    case "house_staff_linked":
      return `email-house-staff-${payload.houseId}-${payload.email}-${payload.eventId || "linked"}`;
    case "house_settlement_disbursed":
      return `email-house-settlement-${payload.settlementId}`;
  }
}

async function executeEmailNotificationDirect(payload: EmailNotificationJobPayload): Promise<void> {
  switch (payload.kind) {
    case "order_confirmation":
      await sendOrderConfirmationEmail(payload);
      break;
    case "order_adjustment_prompt":
      await sendOrderAdjustmentPromptEmail(payload);
      break;
    case "order_delivered_receipt":
      await sendOrderDeliveredReceiptEmail(payload);
      break;
    case "partner_application_received":
      await sendPartnerApplicationReceivedEmail(payload);
      break;
    case "partner_application_approved":
      await sendPartnerInvitationEmail(payload);
      break;
    case "partner_application_rejected":
      await sendPartnerRejectionEmail(payload);
      break;
    case "house_status_changed":
      await sendHouseStatusChangeEmail(payload);
      break;
    case "house_staff_linked":
      await sendHouseStaffLinkedEmail(payload);
      break;
    case "house_settlement_disbursed":
      await sendHouseSettlementEmail(payload);
      break;
  }
}

/**
 * Queues a transactional email job into Inngest with 24h event-level deduplication.
 * In unit tests or upon queue errors, executes directly.
 */
export async function queueEmailNotification(
  payload: EmailNotificationJobPayload
): Promise<void> {
  const eventId = buildIdempotentEmailKey(payload);

  if (process.env.NODE_ENV === "test") {
    await executeEmailNotificationDirect(payload);
    return;
  }

  try {
    await inngest.send({
      name: "email/notification.requested",
      id: eventId,
      data: payload,
    });
  } catch (err) {
    console.error("[Email Dispatcher] Failed to queue via Inngest, attempting direct dispatch:", err);
    await executeEmailNotificationDirect(payload);
  }
}

