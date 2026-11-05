import { NextResponse, type NextRequest } from "next/server";
import {
  handleWhatsAppWebhookPayload,
  verifyWhatsAppWebhookChallenge,
  verifyWhatsAppWebhookSignature,
  type WhatsAppWebhookPayload,
} from "@/services/whatsapp";

/**
 * GET /api/webhooks/whatsapp
 * Meta Webhook verification handshake.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifyWhatsAppWebhookChallenge({
    mode,
    token,
    challenge,
  });

  if (!result.ok) {
    return new NextResponse(result.error, { status: 403 });
  }

  return new NextResponse(result.value, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

/**
 * POST /api/webhooks/whatsapp
 * Receives inbound WhatsApp messages and delivery/read status updates from Meta.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  // Enforce HMAC-SHA256 verification (fail closed when WHATSAPP_APP_SECRET is missing or invalid)
  const isValid = verifyWhatsAppWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await handleWhatsAppWebhookPayload(payload);
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        status: "EVENT_RECEIVED",
        processedMessages: res.value.processedMessages,
        processedStatuses: res.value.processedStatuses,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process webhook payload",
      },
      { status: 500 }
    );
  }
}

