import "server-only";
import { getEmailDomain } from "../domain";

/**
 * Escapes unsafe HTML characters to prevent XSS in email bodies.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailLayoutOptions {
  title: string;
  preheader?: string;
  badge?: {
    text: string;
    variant?: "indigo" | "success" | "warning" | "destructive";
  };
  contentHtml: string;
}

const BADGE_STYLES = {
  indigo: "background-color: #EEF0FF; color: #2824D5; border: 1px solid #C7CBFD;",
  success: "background-color: #ECFDF3; color: #079455; border: 1px solid #A6F4C5;",
  warning: "background-color: #FEF0C7; color: #DC6803; border: 1px solid #FEDF89;",
  destructive: "background-color: #FEF3F2; color: #D92D20; border: 1px solid #FECDCA;",
};

/**
 * Wraps content in the SafiHub standard transactional email layout.
 * Conforms to brand guide design tokens: Royal Indigo (#2824D5), slate neutrals, solid buttons.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const domain = getEmailDomain();
  const safeTitle = escapeHtml(options.title);
  const safePreheader = options.preheader ? escapeHtml(options.preheader) : "";

  const badgeHtml = options.badge
    ? `<div style="margin-bottom: 16px;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; ${BADGE_STYLES[options.badge.variant || "indigo"]}">
          ${escapeHtml(options.badge.text)}
        </span>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F8F9FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #101828; line-height: 1.5; -webkit-font-smoothing: antialiased;">
  ${
    safePreheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${safePreheader}</div>`
      : ""
  }
  <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);">
    <!-- Brand Header -->
    <div style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #F2F4F7; text-align: center;">
      <h1 style="color: #2824D5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SafiHub</h1>
      <p style="color: #667085; font-size: 13px; margin: 4px 0 0 0; font-weight: 400;">Pressing &amp; Blanchisserie à Bukavu</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      ${badgeHtml}
      ${options.contentHtml}
    </div>

    <!-- Brand Footer -->
    <div style="padding: 24px 32px; background-color: #F8F9FC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #667085; line-height: 1.6;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #344054;">
        SafiHub Bukavu &bull; Ibanda, Kadutu, Bagira
      </p>
      <p style="margin: 0 0 12px 0;">
        Plateforme locale de pressing et blanchisserie à la demande.
      </p>
      <p style="margin: 0; color: #98A2B3;">
        Questions ou assistance ? Contactez-nous sur <a href="mailto:contact@${domain}" style="color: #2824D5; text-decoration: none;">contact@${domain}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

