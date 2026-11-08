import "server-only";
import { getAppBaseUrl } from "@/lib/app-url";

export { getAppBaseUrl };
export type EmailSenderType = "contact" | "sales" | "support" | "partners" | "noreply";

/**
 * Returns the active domain for transactional emails.
 * Defaults to process.env.EMAIL_DOMAIN or safihub.online.
 */
export function getEmailDomain(): string {
  const envDomain = process.env.EMAIL_DOMAIN?.trim();
  if (envDomain) {
    return envDomain;
  }
  if (process.env.EMAIL_FROM) {
    const match = process.env.EMAIL_FROM.match(/@([a-zA-Z0-9.-]+)>?/);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return "safihub.online";
}

/**
 * Generates formatted From addresses adhering to SafiHub brand guidelines.
 * Examples:
 * - contact: SafiHub <contact@safihub.online>
 * - sales:   SafiHub Ventes <sales@safihub.online>
 * - partners: SafiHub Partenaires <contact@safihub.online>
 * - support: SafiHub Support <support@safihub.online>
 */
export function getEmailFrom(type: EmailSenderType = "contact"): string {
  const domain = getEmailDomain();
  switch (type) {
    case "sales":
      return `SafiHub Ventes <sales@${domain}>`;
    case "partners":
      return `SafiHub Partenaires <contact@${domain}>`;
    case "support":
      return `SafiHub Support <support@${domain}>`;
    case "noreply":
      return `SafiHub <no-reply@${domain}>`;
    case "contact":
    default:
      if (process.env.EMAIL_FROM?.trim()) {
        return process.env.EMAIL_FROM.trim();
      }
      return `SafiHub <contact@${domain}>`;
  }
}

