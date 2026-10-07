import "server-only";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SentEmailRecord extends EmailPayload {
  id: string;
  sentAt: Date;
}

// In-memory record of sent emails for local dev inspection and unit tests
const sentEmailsStore: SentEmailRecord[] = [];

/**
 * Returns recorded sent emails (useful for testing and dev inspection).
 */
export function getSentEmails(): SentEmailRecord[] {
  return [...sentEmailsStore];
}

/**
 * Clears recorded sent emails.
 */
export function clearSentEmails(): void {
  sentEmailsStore.length = 0;
}

/**
 * Sends a transactional email using Resend if configured, or logs/stores for dev/testing.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailPayload): Promise<{ id: string; success: boolean }> {
  const emailId = `msg_${crypto.randomUUID()}`;
  const record: SentEmailRecord = {
    id: emailId,
    to,
    subject,
    html,
    text,
    sentAt: new Date(),
  };

  sentEmailsStore.push(record);

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.EMAIL_FROM || "SafiHub <no-reply@safihub.cd>";

  if (resendApiKey && process.env.NODE_ENV !== "test") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[Email Service] Failed to send via Resend (${response.status}): ${errorText}`
        );
        return { id: emailId, success: false };
      }

      const data = (await response.json()) as { id?: string };
      return { id: data.id || emailId, success: true };
    } catch (error) {
      console.error("[Email Service] Network error sending email:", error);
      return { id: emailId, success: false };
    }
  }

  // Development/Test fallback: logged to console and stored in memory
  if (process.env.NODE_ENV === "development") {
    console.log(
      `✉️ [Email Service] To: ${to} | Subject: "${subject}" | Record ID: ${emailId}`
    );
  }

  return { id: emailId, success: true };
}

/**
 * Sends a password reset email containing a secure one-time link.
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
  token,
}: {
  email: string;
  resetUrl: string;
  token: string;
}): Promise<{ id: string; success: boolean }> {
  const subject = "SafiHub — Réinitialisation de votre mot de passe";

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const webResetUrl = `${baseUrl}/reset-password?token=${token}`;

  const text = `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur SafiHub.
Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :

${webResetUrl}

Lien direct d'authentification :
${resetUrl}

Code du jeton :
token=${token}

Ce lien expirera dans une heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.

L'équipe SafiHub Bukavu`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 700;">SafiHub</h1>
      <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Pressing & Blanchisserie à Bukavu</p>
    </div>
    
    <h2 style="font-size: 18px; margin-bottom: 16px; color: #0f172a;">Réinitialisation de votre mot de passe</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Bonjour, vous avez demandé à réinitialiser le mot de passe associé à votre compte SafiHub. Cliquez sur le bouton ci-dessous pour définir votre nouveau mot de passe :
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${webResetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
      <a href="${webResetUrl}" style="color: #0284c7; word-break: break-all;">${webResetUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
      Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.
    </p>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
