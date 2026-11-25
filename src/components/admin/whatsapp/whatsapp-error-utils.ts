export const WHATSAPP_ERROR_KEYS = new Set([
  "errors.phoneRequired",
  "errors.phoneTooLong",
  "errors.phoneInvalid",
  "errors.rateLimitSend",
  "errors.rateLimitSimulate",
  "errors.invalidParams",
] as const);

export type WhatsAppErrorKey =
  | "errors.phoneRequired"
  | "errors.phoneTooLong"
  | "errors.phoneInvalid"
  | "errors.rateLimitSend"
  | "errors.rateLimitSimulate"
  | "errors.invalidParams";

export function isWhatsAppErrorKey(error: string): error is WhatsAppErrorKey {
  return WHATSAPP_ERROR_KEYS.has(error as WhatsAppErrorKey);
}
