import "server-only";
import { getEmailFrom, type EmailSenderType } from "./domain";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  senderType?: EmailSenderType;
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
  from,
  senderType = "contact",
}: EmailPayload): Promise<{ id: string; success: boolean; error?: string }> {
  const emailId = `msg_${crypto.randomUUID()}`;
  const effectiveFrom = from || getEmailFrom(senderType);

  const record: SentEmailRecord = {
    id: emailId,
    to,
    subject,
    html,
    text,
    from: effectiveFrom,
    sentAt: new Date(),
  };

  if (process.env.NODE_ENV !== "production") {
    sentEmailsStore.push(record);
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && process.env.NODE_ENV !== "test") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: effectiveFrom,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[Email Service] Resend API rejected message to <${to}> (${response.status}): ${errorText}`
        );
        return { id: emailId, success: false, error: errorText };
      }

      const data = (await response.json()) as { id?: string };
      return { id: data.id || emailId, success: true };
    } catch (error) {
      console.error("[Email Service] Network error sending email via Resend:", error);
      return {
        id: emailId,
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Development/Test fallback: logged to console and stored in memory
  if (process.env.NODE_ENV === "development") {
    console.log(
      `✉️ [Email Service] From: ${effectiveFrom} | To: ${to} | Subject: "${subject}" | Record ID: ${emailId}`
    );
  }

  return { id: emailId, success: true };
}

