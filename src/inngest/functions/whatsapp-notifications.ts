import { inngest } from "../client";
import {
  sendWhatsAppBusinessSettlementNotice,
  sendWhatsAppConditionPhotoProof,
  sendWhatsAppCourierArrivalAlert,
  sendWhatsAppOrderStatusUpdate,
  sendWhatsAppPriceAdjustmentPrompt,
  type BusinessSettlementWhatsAppInput,
  type OrderStatusWhatsAppInput,
} from "@/services/whatsapp";

export type WhatsAppNotificationJobPayload =
  | ({ kind: "order_status" } & OrderStatusWhatsAppInput)
  | {
      kind: "courier_arrival";
      orderId: string;
      orderCode: string;
      customerUserId?: string | null;
      customerPhone: string;
      courierName: string;
      leg: "pickup" | "delivery";
      verificationCode?: string | null;
      trackingToken?: string | null;
      locale?: "fr" | "sw" | "en";
    }
  | {
      kind: "price_adjustment";
      orderId: string;
      orderCode: string;
      customerUserId?: string | null;
      customerPhone: string;
      houseName: string;
      diffAmountCdf: number;
      reason?: string;
      locale?: "fr" | "sw" | "en";
    }
  | ({ kind: "business_settlement" } & BusinessSettlementWhatsAppInput)
  | {
      kind: "condition_photo";
      orderId: string;
      orderCode: string;
      customerPhone: string;
      imageUrl: string;
      caption?: string;
    };

/**
 * Inngest durable function processing asynchronous WhatsApp notification requests.
 */
export const dispatchWhatsAppNotification = inngest.createFunction(
  {
    id: "dispatch-whatsapp-notification",
    triggers: [{ event: "whatsapp/notification.requested" }],
  },
  async ({ event, step }) => {
    const data = event.data as WhatsAppNotificationJobPayload;

    return await step.run("send-whatsapp-cloud-api-message", async () => {
      switch (data.kind) {
        case "order_status": {
          const res = await sendWhatsAppOrderStatusUpdate(data);
          if (!res.ok) throw new Error(res.error);
          return res.value;
        }
        case "courier_arrival": {
          const res = await sendWhatsAppCourierArrivalAlert(data);
          if (!res.ok) throw new Error(res.error);
          return res.value;
        }
        case "price_adjustment": {
          const res = await sendWhatsAppPriceAdjustmentPrompt(data);
          if (!res.ok) throw new Error(res.error);
          return res.value;
        }
        case "business_settlement": {
          const res = await sendWhatsAppBusinessSettlementNotice(data);
          if (!res.ok) throw new Error(res.error);
          return res.value;
        }
        case "condition_photo": {
          const res = await sendWhatsAppConditionPhotoProof(data);
          if (!res.ok) throw new Error(res.error);
          return res.value;
        }
        default:
          throw new Error("Unsupported WhatsApp notification job kind");
      }
    });
  }
);

