import "server-only";

import { err, ok, type Result } from "@/lib/result";
import type {
  WhatsAppListSection,
  WhatsAppReplyButton,
  WhatsAppSendResult,
  WhatsAppTemplateComponent,
} from "./types";

const DEFAULT_GRAPH_API_VERSION = "v23.0";
const GRAPH_API_TIMEOUT_MS = 15000;

/**
 * Normalizes a phone number into digits-only international format for WhatsApp Cloud API.
 * Converts local DRC numbers starting with 0 (e.g. 0991234567) to 243991234567.
 */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `243${digits.slice(1)}`;
  }
  return digits;
}

interface GraphApiCallOptions {
  senderPhoneNumberId?: string;
  body: Record<string, unknown>;
}

/**
 * Executes a POST request to Meta WhatsApp Graph API with timeout and dry-run fallback.
 */
async function callWhatsAppGraphApi(
  options: GraphApiCallOptions
): Promise<Result<{ messageId: string; dryRun: boolean }, string>> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId =
    options.senderPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || DEFAULT_GRAPH_API_VERSION;

  if (!accessToken || !phoneNumberId) {
    return ok({
      messageId: `wamid.dryrun_${crypto.randomUUID()}`,
      dryRun: true,
    });
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.body),
      signal: AbortSignal.timeout(GRAPH_API_TIMEOUT_MS),
    });

    const data = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string; code?: number };
    };

    if (!response.ok) {
      const errorMsg =
        data.error?.message ||
        `WhatsApp Cloud API HTTP ${response.status}`;
      return err(errorMsg);
    }

    const messageId = data.messages?.[0]?.id || `wamid.${crypto.randomUUID()}`;
    return ok({ messageId, dryRun: false });
  } catch (error) {
    return err(
      error instanceof Error
        ? error.message
        : "Network error calling WhatsApp Cloud API"
    );
  }
}

/**
 * Marks an incoming message as read and activates the WhatsApp typing indicator.
 */
export async function markWhatsAppMessageReadAndTyping(
  inboundMessageId: string,
  senderPhoneNumberId?: string
): Promise<Result<boolean, string>> {
  if (!inboundMessageId) {
    return err("inboundMessageId is required");
  }

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId,
    body: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: inboundMessageId,
      typing_indicator: {
        type: "text",
      },
    },
  });

  if (!res.ok) return err(res.error);
  return ok(true);
}

/**
 * Sends a plain text message (within the 24-hour customer service window).
 */
export async function sendWhatsAppTextMessage(params: {
  to: string;
  body: string;
  previewUrl?: boolean;
  replyToMessageId?: string;
  senderPhoneNumberId?: string;
}): Promise<Result<WhatsAppSendResult, string>> {
  const recipientPhone = normalizeWhatsAppPhone(params.to);
  if (!recipientPhone) {
    return err("Recipient phone number is required");
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "text",
    text: {
      preview_url: params.previewUrl ?? true,
      body: params.body,
    },
  };

  if (params.replyToMessageId) {
    payload.context = { message_id: params.replyToMessageId };
  }

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId: params.senderPhoneNumberId,
    body: payload,
  });

  if (!res.ok) return err(res.error);
  return ok({
    messageId: res.value.messageId,
    recipientPhone,
    dryRun: res.value.dryRun,
  });
}

/**
 * Sends an interactive Quick Reply button message (up to 3 buttons).
 */
export async function sendWhatsAppInteractiveButtons(params: {
  to: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttons: WhatsAppReplyButton[];
  replyToMessageId?: string;
  senderPhoneNumberId?: string;
}): Promise<Result<WhatsAppSendResult, string>> {
  const recipientPhone = normalizeWhatsAppPhone(params.to);
  if (!recipientPhone) {
    return err("Recipient phone number is required");
  }
  if (params.buttons.length === 0 || params.buttons.length > 3) {
    return err("WhatsApp interactive button messages require between 1 and 3 buttons");
  }

  const interactive: Record<string, unknown> = {
    type: "button",
    body: {
      text: params.bodyText,
    },
    action: {
      buttons: params.buttons.slice(0, 3).map((btn) => ({
        type: "reply",
        reply: {
          id: btn.id.slice(0, 256),
          title: btn.title.slice(0, 20),
        },
      })),
    },
  };

  if (params.headerText) {
    interactive.header = {
      type: "text",
      text: params.headerText.slice(0, 60),
    };
  }
  if (params.footerText) {
    interactive.footer = {
      text: params.footerText.slice(0, 60),
    };
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "interactive",
    interactive,
  };

  if (params.replyToMessageId) {
    payload.context = { message_id: params.replyToMessageId };
  }

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId: params.senderPhoneNumberId,
    body: payload,
  });

  if (!res.ok) return err(res.error);
  return ok({
    messageId: res.value.messageId,
    recipientPhone,
    dryRun: res.value.dryRun,
  });
}

/**
 * Sends an interactive List message (up to 10 total rows across sections).
 */
export async function sendWhatsAppInteractiveList(params: {
  to: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttonText: string;
  sections: WhatsAppListSection[];
  replyToMessageId?: string;
  senderPhoneNumberId?: string;
}): Promise<Result<WhatsAppSendResult, string>> {
  const recipientPhone = normalizeWhatsAppPhone(params.to);
  if (!recipientPhone) {
    return err("Recipient phone number is required");
  }

  let remainingRows = 10;
  const trimmedSections: WhatsAppListSection[] = [];
  for (const section of params.sections) {
    if (remainingRows <= 0) break;
    const rows = section.rows.slice(0, remainingRows).map((r) => ({
      id: r.id.slice(0, 200),
      title: r.title.slice(0, 24),
      ...(r.description ? { description: r.description.slice(0, 72) } : {}),
    }));
    if (rows.length > 0) {
      trimmedSections.push({
        title: section.title.slice(0, 24),
        rows,
      });
      remainingRows -= rows.length;
    }
  }

  if (trimmedSections.length === 0) {
    return err("Interactive list requires at least one row");
  }

  const interactive: Record<string, unknown> = {
    type: "list",
    body: {
      text: params.bodyText,
    },
    action: {
      button: params.buttonText.slice(0, 20),
      sections: trimmedSections,
    },
  };

  if (params.headerText) {
    interactive.header = {
      type: "text",
      text: params.headerText.slice(0, 60),
    };
  }
  if (params.footerText) {
    interactive.footer = {
      text: params.footerText.slice(0, 60),
    };
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "interactive",
    interactive,
  };

  if (params.replyToMessageId) {
    payload.context = { message_id: params.replyToMessageId };
  }

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId: params.senderPhoneNumberId,
    body: payload,
  });

  if (!res.ok) return err(res.error);
  return ok({
    messageId: res.value.messageId,
    recipientPhone,
    dryRun: res.value.dryRun,
  });
}

/**
 * Sends a pre-approved Meta WhatsApp Template message (required outside the 24h customer service window).
 */
export async function sendWhatsAppTemplateMessage(params: {
  to: string;
  templateName: string;
  localeCode?: string;
  components?: WhatsAppTemplateComponent[];
  senderPhoneNumberId?: string;
}): Promise<Result<WhatsAppSendResult, string>> {
  const recipientPhone = normalizeWhatsAppPhone(params.to);
  if (!recipientPhone) {
    return err("Recipient phone number is required");
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "template",
    template: {
      name: params.templateName,
      language: {
        code: params.localeCode || "fr",
      },
      ...(params.components && params.components.length > 0
        ? { components: params.components }
        : {}),
    },
  };

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId: params.senderPhoneNumberId,
    body: payload,
  });

  if (!res.ok) return err(res.error);
  return ok({
    messageId: res.value.messageId,
    recipientPhone,
    dryRun: res.value.dryRun,
  });
}

/**
 * Sends an image message (e.g. Cloudflare R2 condition proof or delivery proof photo).
 */
export async function sendWhatsAppImageMessage(params: {
  to: string;
  imageUrl?: string;
  mediaId?: string;
  caption?: string;
  senderPhoneNumberId?: string;
}): Promise<Result<WhatsAppSendResult, string>> {
  const recipientPhone = normalizeWhatsAppPhone(params.to);
  if (!recipientPhone) {
    return err("Recipient phone number is required");
  }
  if (!params.imageUrl && !params.mediaId) {
    return err("Either imageUrl or mediaId must be provided");
  }

  const imageObject: Record<string, unknown> = {};
  if (params.mediaId) {
    imageObject.id = params.mediaId;
  } else if (params.imageUrl) {
    imageObject.link = params.imageUrl;
  }
  if (params.caption) {
    imageObject.caption = params.caption;
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "image",
    image: imageObject,
  };

  const res = await callWhatsAppGraphApi({
    senderPhoneNumberId: params.senderPhoneNumberId,
    body: payload,
  });

  if (!res.ok) return err(res.error);
  return ok({
    messageId: res.value.messageId,
    recipientPhone,
    dryRun: res.value.dryRun,
  });
}

