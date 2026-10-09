export type NotificationChannel = "in_app" | "push" | "sms" | "whatsapp_link";

export type NotificationLocale = "fr" | "sw" | "en";

export type NotificationTemplateKey =
  | "order_created"
  | "order_accepted"
  | "order_rejected"
  | "order_expired"
  | "pickup_assigned"
  | "pickup_in_progress"
  | "picked_up"
  | "received"
  | "price_adjusted"
  | "washing"
  | "ready"
  | "delivery_assigned"
  | "delivery_in_progress"
  | "delivered"
  | "order_cancelled"
  | "order_disputed"
  | "house_acceptance_reminder"
  | "admin_escalation_alert";

export interface TemplateParams {
  orderId?: string;
  orderIdShort?: string;
  houseName?: string;
  courierName?: string;
  itemCount?: number;
  amount?: number | string;
  diffAmount?: number | string;
  currency?: string;
  reason?: string;
  customerName?: string;
  slotTime?: string;
  [key: string]: string | number | undefined;
}

export interface SendNotificationInput {
  userId?: string | null;
  phone?: string | null;
  orderId?: string | null;
  channel?: NotificationChannel;
  templateKey: NotificationTemplateKey;
  locale?: string;
  params?: TemplateParams;
  customTitle?: string;
  customBody?: string;
}
