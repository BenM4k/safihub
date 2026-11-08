import { inngest } from "../client";
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
} from "@/services/email";

export type EmailNotificationJobPayload =
  | {
      kind: "order_confirmation";
      orderId: string;
      email: string;
      customerName: string;
      orderCode: string;
      houseName: string;
      pickupWindow: string;
      deliveryAddress: string;
      items: Array<{ name: string; quantity: number; service?: string; priceCdf?: number }>;
      totalAmountCdf: number;
      trackingUrl: string;
    }
  | {
      kind: "order_adjustment_prompt";
      orderId: string;
      email: string;
      customerName: string;
      orderCode: string;
      houseName: string;
      diffAmountCdf: number;
      newTotalAmountCdf: number;
      reason?: string;
      approvalUrl: string;
    }
  | {
      kind: "order_delivered_receipt";
      orderId: string;
      email: string;
      customerName: string;
      orderCode: string;
      houseName: string;
      totalPaidCdf: number;
      totalPaidUsd?: number | null;
      exchangeRate?: number | null;
      trackingUrl: string;
    }
  | {
      kind: "partner_application_received";
      applicationId: string;
      email: string;
      contactName: string;
      houseName: string;
    }
  | {
      kind: "partner_application_approved";
      applicationId: string;
      email: string;
      contactName: string;
      houseName: string;
      inviteUrl: string;
    }
  | {
      kind: "partner_application_rejected";
      applicationId: string;
      email: string;
      contactName: string;
      houseName: string;
      adminNote: string;
    }
  | {
      kind: "house_status_changed";
      houseId: string;
      email: string;
      houseName: string;
      isActive: boolean;
      reason?: string;
      eventId?: string;
    }
  | {
      kind: "house_staff_linked";
      houseId: string;
      email: string;
      userName: string;
      houseName: string;
      houseSlug: string;
      eventId?: string;
    }
  | {
      kind: "house_settlement_disbursed";
      settlementId: string;
      email: string;
      houseName: string;
      netPayoutAmountCdf: number;
      commissionAmountCdf?: number;
      ordersCount?: number;
    };

/**
 * Inngest durable function processing asynchronous, idempotent transactional email dispatches.
 */
export const dispatchEmailNotification = inngest.createFunction(
  {
    id: "dispatch-email-notification",
    triggers: [{ event: "email/notification.requested" }],
  },
  async ({ event, step }) => {
    const data = event.data as EmailNotificationJobPayload;

    return await step.run("send-transactional-email-resend", async () => {
      switch (data.kind) {
        case "order_confirmation": {
          const res = await sendOrderConfirmationEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send order confirmation email");
          return res;
        }
        case "order_adjustment_prompt": {
          const res = await sendOrderAdjustmentPromptEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send adjustment prompt email");
          return res;
        }
        case "order_delivered_receipt": {
          const res = await sendOrderDeliveredReceiptEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send delivery receipt email");
          return res;
        }
        case "partner_application_received": {
          const res = await sendPartnerApplicationReceivedEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send application received email");
          return res;
        }
        case "partner_application_approved": {
          const res = await sendPartnerInvitationEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send partner invitation email");
          return res;
        }
        case "partner_application_rejected": {
          const res = await sendPartnerRejectionEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send partner rejection email");
          return res;
        }
        case "house_status_changed": {
          const res = await sendHouseStatusChangeEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send house status email");
          return res;
        }
        case "house_staff_linked": {
          const res = await sendHouseStaffLinkedEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send staff linked email");
          return res;
        }
        case "house_settlement_disbursed": {
          const res = await sendHouseSettlementEmail(data);
          if (!res.success) throw new Error(res.error || "Failed to send settlement email");
          return res;
        }
        default:
          throw new Error("Unsupported email notification kind");
      }
    });
  }
);

