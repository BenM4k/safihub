import type { NotificationLocale, NotificationTemplateKey } from "@/services/notifications";

export type WhatsAppLocale = NotificationLocale;

export interface WhatsAppReplyButton {
  id: string;
  title: string;
}

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

export interface WhatsAppTemplateParameter {
  type: "text" | "image";
  text?: string;
  image?: {
    id?: string;
    link?: string;
  };
}

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "quick_reply" | "url" | "copy_code";
  index?: number;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppSendResult {
  messageId: string;
  recipientPhone: string;
  dryRun: boolean;
}

export interface WhatsAppLocationPayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppInboundMessage {
  id: string;
  from: string;
  timestamp: string;
  type: "text" | "interactive" | "location" | "image" | "button" | string;
  text?: {
    body: string;
  };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  button?: {
    payload: string;
    text: string;
  };
  location?: WhatsAppLocationPayload;
}

export interface WhatsAppStatusUpdate {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
  }>;
}

export interface WhatsAppWebhookChangeValue {
  messaging_product: "whatsapp";
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile?: {
      name?: string;
    };
    wa_id: string;
  }>;
  messages?: WhatsAppInboundMessage[];
  statuses?: WhatsAppStatusUpdate[];
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value?: WhatsAppWebhookChangeValue;
    }>;
  }>;
}

export type WhatsAppBotStep =
  | "IDLE"
  | "SELECTING_NEIGHBORHOOD"
  | "SELECTING_HOUSE"
  | "SELECTING_SERVICE"
  | "SELECTING_ITEMS"
  | "SELECTING_QUANTITY"
  | "SELECTING_SLOT"
  | "CAPTURING_LANDMARK"
  | "CONFIRMING_ORDER";

export interface WhatsAppBotCartItem {
  houseItemId: string;
  serviceId: string;
  itemId: string;
  fabricId: string;
  itemName: string;
  serviceName: string;
  fabricName: string;
  unitPriceCdf: number;
  quantity: number;
}

export interface WhatsAppBotSlotOption {
  index: number;
  startIso: string;
  endIso: string;
  label: string;
}

export interface WhatsAppBotSession {
  phone: string;
  customerName?: string;
  locale: WhatsAppLocale;
  step: WhatsAppBotStep;
  neighborhoodId?: string;
  neighborhoodName?: string;
  houseId?: string;
  houseName?: string;
  selectedServiceId?: string;
  selectedServiceName?: string;
  pendingHouseItemId?: string;
  items: WhatsAppBotCartItem[];
  availableSlots?: WhatsAppBotSlotOption[];
  selectedSlot?: {
    startIso: string;
    endIso: string;
    label: string;
  };
  landmark?: string;
  idempotencyKey?: string;
  updatedAt: number;
}

export interface OrderStatusWhatsAppInput {
  orderId: string;
  orderCode: string;
  trackingToken?: string | null;
  customerUserId?: string | null;
  customerPhone: string;
  customerName?: string;
  houseName?: string;
  courierName?: string;
  status: NotificationTemplateKey;
  amountCdf?: number;
  diffAmountCdf?: number;
  itemCount?: number;
  reason?: string;
  verificationCode?: string | null;
  locale?: WhatsAppLocale;
}

export interface BusinessSettlementWhatsAppInput {
  houseId: string;
  houseName: string;
  contactPhone: string;
  amount: number;
  currency: "CDF" | "USD";
  reference?: string;
  method?: "mobile_money" | "bank" | "cash";
  period?: string;
  locale?: WhatsAppLocale;
}

