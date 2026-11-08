import "server-only";

export type EmailSenderType = "contact" | "sales" | "support" | "partners" | "noreply";

/**
 * Resolves the public base URL of the application for email links (tracking, CTA buttons, auth tokens).
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL
 * 2. BETTER_AUTH_URL
 * 3. https://${EMAIL_DOMAIN} (fallback to https://safihub.online)
 */
export function getAppBaseUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    (process.env.EMAIL_DOMAIN?.trim()
      ? `https://${process.env.EMAIL_DOMAIN.trim()}`
      : "https://safihub.online");

  return candidate.replace(/\/+$/, "");
}

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

