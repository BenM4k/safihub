export const SAFIHUB_SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "243999000123";

/**
 * Builds a WhatsApp deep-link URL for SafiHub customer and partner support.
 */
export function getSupportWhatsAppUrl(message: string): string {
  const sanitizedPhone = SAFIHUB_SUPPORT_WHATSAPP.replace(/\D/g, "");
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}
