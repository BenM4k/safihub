import "server-only";

import {
  createGuestUser,
  getCustomerHouseDetail,
  getCustomerHousesList,
  getLatestActiveOrderByPhone,
  getNeighborhoods,
  getOrderById,
  getUserByContactPhone,
  updateOrderLandmarkWithGps,
} from "@/dal";
import { err, ok, type Result } from "@/lib/result";
import { toBukavuDateTime } from "@/services/availability/bukavu-time";
import {
  approveCustomerPriceAdjustment,
  declineCustomerPriceAdjustment,
  estimateCustomerCart,
   getCheckoutPickupSlots,
  placeCustomerOrder,
} from "@/services/order";
import {
  markWhatsAppMessageReadAndTyping,
  normalizeWhatsAppPhone,
  sendWhatsAppInteractiveButtons,
  sendWhatsAppInteractiveList,
  sendWhatsAppTextMessage,
} from "./client";
import {
  claimInboundWhatsAppMessage,
  clearWhatsAppBotSession,
  getWhatsAppBotSession,
  recordCustomerServiceWindowOpen,
  saveWhatsAppBotSession,
  unclaimInboundWhatsAppMessage,
} from "./session";
import { formatCdfAmount, getBotCopy } from "./templates";
import type {
  WhatsAppBotSession,
  WhatsAppBotSlotOption,
  WhatsAppInboundMessage,
  WhatsAppLocale,
  WhatsAppWebhookPayload,
} from "./types";

const RESET_KEYWORDS = new Set([
  "menu",
  "bonjour",
  "salut",
  "hello",
  "hi",
  "jambo",
  "habari",
  "start",
  "commander",
  "agiza",
  "order",
  "recommencer",
  "reset",
]);

/**
 * Resolves the canonical SafiHub public base URL for customer links.
 */
function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://safihub.com"
  ).replace(/\/$/, "");
}

/**
 * Extracts action identifiers from interactive button/list replies or template quick-reply button payloads.
 */
function extractInteractiveActionId(message: WhatsAppInboundMessage): string | null {
  if (message.type === "interactive") {
    if (message.interactive?.type === "button_reply") {
      return message.interactive.button_reply?.id ?? null;
    }
    if (message.interactive?.type === "list_reply") {
      return message.interactive.list_reply?.id ?? null;
    }
  }
  if (message.type === "button" && message.button?.payload) {
    return message.button.payload;
  }
  return null;
}

/**
 * Compares two phone numbers using normalized DRC international digits.
 */
function phonesMatch(phoneA: string | null | undefined, phoneB: string): boolean {
  if (!phoneA) return false;
  return normalizeWhatsAppPhone(phoneA) === normalizeWhatsAppPhone(phoneB);
}

/**
 * Sends the top-level welcome greeting with action buttons (Order, Language toggle).
 */
async function sendWelcomePrompt(
  session: WhatsAppBotSession,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  const toggleLocale: WhatsAppLocale = session.locale === "sw" ? "fr" : "sw";
  const toggleLabel =
    session.locale === "sw" ? copy.btnLanguageFr : copy.btnLanguageSw;

  await sendWhatsAppInteractiveButtons({
    to: session.phone,
    headerText: copy.welcomeHeader,
    bodyText: copy.welcomeBody,
    buttons: [
      { id: "START_ORDER", title: copy.btnStartOrder },
      { id: `SET_LOCALE:${toggleLocale}`, title: toggleLabel },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to select their Bukavu neighborhood from a list picker.
 */
async function promptSelectNeighborhood(
  session: WhatsAppBotSession,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  const allNeighborhoods = await getNeighborhoods();
  const served = allNeighborhoods.filter((n) => n.status === "served");

  if (served.length === 0) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: copy.noNeighborhoodsAvailable,
      senderPhoneNumberId,
    });
    return;
  }

  session.step = "SELECTING_NEIGHBORHOOD";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveList({
    to: session.phone,
    headerText: copy.selectNeighborhoodHeader,
    bodyText: copy.selectNeighborhoodBody,
    buttonText: copy.selectNeighborhoodBtn,
    sections: [
      {
        title: "Bukavu",
        rows: served.slice(0, 10).map((n) => ({
          id: `SELECT_NEIGHBORHOOD:${n.id}`,
          title: n.name,
          description: n.zoneName ? `Zone ${n.zoneName}` : undefined,
        })),
      },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to select an eligible laundry house serving their neighborhood.
 */
async function promptSelectHouse(
  session: WhatsAppBotSession,
  neighborhoodId: string,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  const allNeighborhoods = await getNeighborhoods();
  const neighborhood = allNeighborhoods.find((n) => n.id === neighborhoodId);
  if (!neighborhood || neighborhood.status !== "served") {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const houses = await getCustomerHousesList();
  const eligibleHouses = houses.filter(
    (h) =>
      h.isActive &&
      !h.isPaused &&
      h.coveredNeighborhoodIds.includes(neighborhoodId)
  );

  if (eligibleHouses.length === 0) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: copy.noHousesForNeighborhood(neighborhood.name),
      senderPhoneNumberId,
    });
    return;
  }

  session.neighborhoodId = neighborhood.id;
  session.neighborhoodName = neighborhood.name;
  session.step = "SELECTING_HOUSE";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveList({
    to: session.phone,
    headerText: copy.selectHouseHeader,
    bodyText: copy.selectHouseBody(neighborhood.name),
    buttonText: copy.selectHouseBtn,
    sections: [
      {
        title: neighborhood.name,
        rows: eligibleHouses.slice(0, 10).map((h) => ({
          id: `SELECT_HOUSE:${h.id}`,
          title: h.name,
          description: copy.housePriceDescription(
            formatCdfAmount(h.minimumOrderAmount),
            formatCdfAmount(h.minItemPriceCdf)
          ),
        })),
      },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to choose a service type (e.g. Wash & Iron) offered by the chosen house.
 */
async function promptSelectService(
  session: WhatsAppBotSession,
  houseId: string,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  const detail = await getCustomerHouseDetail(houseId);
  if (!detail || !detail.house.isActive || detail.house.isPaused) {
    if (session.neighborhoodId) {
      await promptSelectHouse(session, session.neighborhoodId, senderPhoneNumberId);
    } else {
      await promptSelectNeighborhood(session, senderPhoneNumberId);
    }
    return;
  }

  if (session.houseId !== detail.house.id) {
    session.items = [];
  }
  session.houseId = detail.house.id;
  session.houseName = detail.house.name;
  session.step = "SELECTING_SERVICE";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveList({
    to: session.phone,
    headerText: copy.selectServiceHeader(detail.house.name),
    bodyText: copy.selectServiceBody(
      detail.house.name,
      formatCdfAmount(detail.house.minimumOrderAmount)
    ),
    buttonText: copy.selectServiceBtn,
    sections: [
      {
        title: detail.house.name,
        rows: detail.services.slice(0, 10).map((s) => ({
          id: `SELECT_SERVICE:${s.id}`,
          title: session.locale === "sw" ? s.nameSw || s.nameFr : s.nameFr,
        })),
      },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to select an article from the catalogue.
 */
async function promptSelectItems(
  session: WhatsAppBotSession,
  serviceId: string,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (!session.houseId) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const detail = await getCustomerHouseDetail(session.houseId);
  if (!detail) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const service = detail.services.find((s) => s.id === serviceId);
  const serviceItems = detail.items.filter(
    (it) => it.serviceId === serviceId && !it.isExcluded
  );

  if (!service || serviceItems.length === 0) {
    await promptSelectService(session, session.houseId, senderPhoneNumberId);
    return;
  }

  const serviceLabel =
    session.locale === "sw" ? service.nameSw || service.nameFr : service.nameFr;

  session.selectedServiceId = service.id;
  session.selectedServiceName = serviceLabel;
  session.step = "SELECTING_ITEMS";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveList({
    to: session.phone,
    headerText: copy.selectItemHeader(serviceLabel),
    bodyText: copy.selectItemBody,
    buttonText: copy.selectItemBtn,
    sections: [
      {
        title: serviceLabel,
        rows: serviceItems.slice(0, 10).map((it) => {
          const itemLabel =
            session.locale === "sw"
              ? it.itemNameSw || it.itemNameFr
              : it.itemNameFr;
          const fabricLabel =
            session.locale === "sw"
              ? it.fabricNameSw || it.fabricNameFr
              : it.fabricNameFr;
          return {
            id: `SELECT_ITEM:${it.houseItemId}`,
            title: itemLabel,
            description: `${fabricLabel} • ${formatCdfAmount(it.priceCdf)}`,
          };
        }),
      },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to select the quantity of an item using quick-reply buttons or text.
 */
async function promptSelectQuantity(
  session: WhatsAppBotSession,
  houseItemId: string,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (!session.houseId) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const detail = await getCustomerHouseDetail(session.houseId);
  const item = detail?.items.find((it) => it.houseItemId === houseItemId);
  if (!item) {
    if (session.selectedServiceId) {
      await promptSelectItems(
        session,
        session.selectedServiceId,
        senderPhoneNumberId
      );
    } else {
      await promptSelectService(session, session.houseId, senderPhoneNumberId);
    }
    return;
  }

  const itemName =
    session.locale === "sw" ? item.itemNameSw || item.itemNameFr : item.itemNameFr;
  const fabricName =
    session.locale === "sw"
      ? item.fabricNameSw || item.fabricNameFr
      : item.fabricNameFr;

  session.pendingHouseItemId = item.houseItemId;
  session.step = "SELECTING_QUANTITY";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveButtons({
    to: session.phone,
    bodyText: copy.selectQuantityBody(
      `${itemName} (${fabricName})`,
      formatCdfAmount(item.priceCdf)
    ),
    buttons: [
      { id: "QTY:1", title: "1" },
      { id: "QTY:2", title: "2" },
      { id: "QTY:3", title: "3" },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Handles quantity selection for an item and updates the customer's cart.
 */
async function handleQuantityChosen(
  session: WhatsAppBotSession,
  quantity: number,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (!session.houseId || !session.pendingHouseItemId || quantity <= 0) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const detail = await getCustomerHouseDetail(session.houseId);
  const catalogItem = detail?.items.find(
    (it) => it.houseItemId === session.pendingHouseItemId
  );

  if (!catalogItem) {
    await promptSelectService(session, session.houseId, senderPhoneNumberId);
    return;
  }

  const itemName =
    session.locale === "sw"
      ? catalogItem.itemNameSw || catalogItem.itemNameFr
      : catalogItem.itemNameFr;
  const serviceName =
    session.locale === "sw"
      ? catalogItem.serviceNameSw || catalogItem.serviceNameFr
      : catalogItem.serviceNameFr;
  const fabricName =
    session.locale === "sw"
      ? catalogItem.fabricNameSw || catalogItem.fabricNameFr
      : catalogItem.fabricNameFr;

  const existing = session.items.find(
    (i) => i.houseItemId === catalogItem.houseItemId
  );
  if (existing) {
    existing.quantity = Math.min(50, existing.quantity + quantity);
  } else {
    session.items.push({
      houseItemId: catalogItem.houseItemId,
      serviceId: catalogItem.serviceId,
      itemId: catalogItem.itemId,
      fabricId: catalogItem.fabricId,
      itemName,
      serviceName,
      fabricName,
      unitPriceCdf: catalogItem.priceCdf,
      quantity: Math.min(50, quantity),
    });
  }

  session.pendingHouseItemId = undefined;
  session.step = "SELECTING_ITEMS";
  await saveWhatsAppBotSession(session);

  const cartLines = session.items
    .map(
      (i) =>
        `• ${i.quantity}x ${i.itemName} (${i.fabricName} - ${i.serviceName}) : ${formatCdfAmount(
          i.unitPriceCdf * i.quantity
        )}`
    )
    .join("\n");
  const subtotal = session.items.reduce(
    (acc, i) => acc + i.unitPriceCdf * i.quantity,
    0
  );

  await sendWhatsAppInteractiveButtons({
    to: session.phone,
    bodyText: copy.cartUpdatedBody(cartLines, formatCdfAmount(subtotal)),
    buttons: [
      { id: "MORE_ITEMS", title: copy.btnAddMoreItems },
      { id: "CHANGE_SERVICE", title: copy.btnChangeService },
      { id: "PROCEED_SLOTS", title: copy.btnProceedCheckout },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to select a 2-hour pickup slot based on opening hours and courier dual-zone coverage.
 */
async function promptSelectSlot(
  session: WhatsAppBotSession,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (!session.houseId || !session.neighborhoodId || session.items.length === 0) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  // Canonical cart estimate to verify minimumOrderMet on the server
  const estimateRes = await estimateCustomerCart(
    session.houseId,
    session.items.map((it) => ({
      houseItemId: it.houseItemId,
      serviceId: it.serviceId,
      itemId: it.itemId,
      fabricId: it.fabricId,
      quantity: it.quantity,
    })),
    session.neighborhoodId
  );

  if (!estimateRes.ok) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: copy.cartEstimateError,
      senderPhoneNumberId,
    });
    return;
  }

  if (!estimateRes.value.minimumOrderMet) {
    await sendWhatsAppInteractiveButtons({
      to: session.phone,
      bodyText: copy.minOrderNotMet(
        formatCdfAmount(estimateRes.value.minimumOrderAmount),
        formatCdfAmount(estimateRes.value.missingAmount)
      ),
      buttons: [
        { id: "MORE_ITEMS", title: copy.btnAddMoreItems },
        { id: "CHANGE_SERVICE", title: copy.btnChangeService },
      ],
      senderPhoneNumberId,
    });
    return;
  }

  const slotsRes = await getCheckoutPickupSlots({
    houseId: session.houseId,
    neighborhoodId: session.neighborhoodId,
  });

  const candidateSlots =
    slotsRes.slots.length > 0
      ? slotsRes.slots.slice(0, 8)
      : slotsRes.nextAvailableSlot
        ? [slotsRes.nextAvailableSlot]
        : [];

  if (candidateSlots.length === 0) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: copy.noSlotsAvailable,
      senderPhoneNumberId,
    });
    return;
  }

  const slotOptions: WhatsAppBotSlotOption[] = candidateSlots.map(
    (slot, idx) => {
      const bStart = toBukavuDateTime(slot.start);
      const bEnd = toBukavuDateTime(slot.end);
      return {
        index: idx,
        startIso: slot.start.toISOString(),
        endIso: slot.end.toISOString(),
        label: `${bStart.dateString} (${bStart.timeString} - ${bEnd.timeString})`,
      };
    }
  );

  session.availableSlots = slotOptions;
  session.step = "SELECTING_SLOT";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppInteractiveList({
    to: session.phone,
    headerText: copy.selectSlotHeader,
    bodyText: copy.selectSlotBody,
    buttonText: copy.selectSlotBtn,
    sections: [
      {
        title: copy.availableSlotsSectionTitle,
        rows: slotOptions.map((opt) => ({
          id: `SELECT_SLOT:${opt.index}`,
          title: opt.label.slice(0, 24),
          description: opt.label,
        })),
      },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Prompts the customer to provide their Bukavu street landmark or drop a WhatsApp GPS location pin.
 */
async function promptCaptureLandmark(
  session: WhatsAppBotSession,
  slotIndex: number,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  const chosen = session.availableSlots?.find((s) => s.index === slotIndex);
  if (!chosen) {
    await promptSelectSlot(session, senderPhoneNumberId);
    return;
  }

  session.selectedSlot = {
    startIso: chosen.startIso,
    endIso: chosen.endIso,
    label: chosen.label,
  };
  session.step = "CAPTURING_LANDMARK";
  await saveWhatsAppBotSession(session);

  await sendWhatsAppTextMessage({
    to: session.phone,
    body: `${copy.captureLandmarkHeader}\n\n${copy.captureLandmarkBody(
      session.neighborhoodName || "Bukavu"
    )}`,
    senderPhoneNumberId,
  });
}

/**
 * Recalculates final cart total and displays order confirmation buttons.
 */
async function promptOrderConfirmation(
  session: WhatsAppBotSession,
  landmarkText: string,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (
    !session.houseId ||
    !session.neighborhoodId ||
    !session.selectedSlot ||
    session.items.length === 0
  ) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const estimateRes = await estimateCustomerCart(
    session.houseId,
    session.items.map((it) => ({
      houseItemId: it.houseItemId,
      serviceId: it.serviceId,
      itemId: it.itemId,
      fabricId: it.fabricId,
      quantity: it.quantity,
    })),
    session.neighborhoodId
  );

  if (!estimateRes.ok) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: copy.cartEstimateError,
      senderPhoneNumberId,
    });
    return;
  }

  session.landmark = landmarkText.trim();
  session.idempotencyKey = `wa_${crypto.randomUUID()}`;
  session.step = "CONFIRMING_ORDER";
  await saveWhatsAppBotSession(session);

  const itemsList = session.items
    .map(
      (i) =>
        `• ${i.quantity}x ${i.itemName} (${i.fabricName}) : ${formatCdfAmount(
          i.unitPriceCdf * i.quantity
        )}`
    )
    .join("\n");

  const summaryBody = copy.orderSummaryBody({
    houseName: session.houseName || "Pressing",
    neighborhoodName: session.neighborhoodName || "Bukavu",
    landmark: session.landmark,
    slotLabel: session.selectedSlot.label,
    itemsList,
    itemsTotalCdf: formatCdfAmount(estimateRes.value.itemsTotal),
    deliveryFeeCdf: formatCdfAmount(estimateRes.value.deliveryFee),
    totalDueCdf: formatCdfAmount(estimateRes.value.totalDue),
  });

  await sendWhatsAppInteractiveButtons({
    to: session.phone,
    headerText: copy.orderSummaryHeader,
    bodyText: summaryBody,
    buttons: [
      { id: "CONFIRM_ORDER", title: copy.btnConfirmOrder },
      { id: "CANCEL_ORDER", title: copy.btnCancelOrder },
    ],
    senderPhoneNumberId,
  });
}

/**
 * Submits the conversational WhatsApp order to the canonical placeCustomerOrder service.
 */
async function finalizeWhatsAppOrder(
  session: WhatsAppBotSession,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (
    !session.houseId ||
    !session.neighborhoodId ||
    !session.selectedSlot ||
    !session.landmark ||
    session.items.length === 0
  ) {
    await promptSelectNeighborhood(session, senderPhoneNumberId);
    return;
  }

  const contactPhone = `+${normalizeWhatsAppPhone(session.phone)}`;

  // 1. Find or create guest customer account
  let customer =
    (await getUserByContactPhone(contactPhone)) ||
    (await getUserByContactPhone(normalizeWhatsAppPhone(session.phone)));

  if (!customer) {
    const guestRes = await createGuestUser({
      name: session.customerName || "Client WhatsApp",
      phone: contactPhone,
    });
    if (!guestRes.ok) {
      await sendWhatsAppTextMessage({
        to: session.phone,
        body: copy.accountCreationError,
        senderPhoneNumberId,
      });
      return;
    }
    customer = guestRes.value;
  }

  // 2. Submit through canonical placeCustomerOrder validation engine
  const idempotencyKey = session.idempotencyKey || `wa_${crypto.randomUUID()}`;
  const orderRes = await placeCustomerOrder({
    idempotencyKey,
    customerId: customer.id,
    houseId: session.houseId,
    customerNeighborhoodId: session.neighborhoodId,
    landmark: session.landmark,
    contactPhone,
    pickupSlot: {
      start: new Date(session.selectedSlot.startIso),
      end: new Date(session.selectedSlot.endIso),
    },
    items: session.items.map((it) => ({
      houseItemId: it.houseItemId,
      serviceId: it.serviceId,
      itemId: it.itemId,
      fabricId: it.fabricId,
      quantity: it.quantity,
    })),
    paymentCurrency: "CDF",
    source: "whatsapp",
  });

  if (!orderRes.ok) {
    await sendWhatsAppTextMessage({
      to: session.phone,
      body: `⚠️ ${orderRes.error.message}`,
      senderPhoneNumberId,
    });
    return;
  }

  const createdOrder = await getOrderById(orderRes.value.orderId);
  const totalDue = createdOrder?.totalDue ?? 0;
  const trackingUrl = `${getAppBaseUrl()}/track/${orderRes.value.trackingToken}`;

  const successText = copy.orderCreatedSuccess({
    orderCode: orderRes.value.code,
    houseName: session.houseName || "Pressing",
    totalDueCdf: formatCdfAmount(totalDue),
    slotLabel: session.selectedSlot.label,
    trackingUrl,
  });

  await clearWhatsAppBotSession(session.phone);

  await sendWhatsAppTextMessage({
    to: session.phone,
    body: successText,
    senderPhoneNumberId,
  });
}

/**
 * Handles customer quick-reply approvals or refusals for price adjustments (Domain Invariant #5).
 */
async function handlePriceAdjustmentAction(params: {
  action: "approve" | "reject";
  orderId: string;
  senderPhone: string;
  locale: WhatsAppLocale;
  senderPhoneNumberId?: string;
}): Promise<void> {
  const copy = getBotCopy(params.locale);
  const order = await getOrderById(params.orderId);
  if (!order || !phonesMatch(order.customerPhone, params.senderPhone)) {
    await sendWhatsAppTextMessage({
      to: params.senderPhone,
      body: copy.orderNotFoundOrUnauthorized,
      senderPhoneNumberId: params.senderPhoneNumberId,
    });
    return;
  }

  if (params.action === "approve") {
    const res = await approveCustomerPriceAdjustment(
      order.id,
      order.customerId,
      "app"
    );
    if (!res.ok) {
      await sendWhatsAppTextMessage({
        to: params.senderPhone,
        body: `⚠️ ${res.error}`,
        senderPhoneNumberId: params.senderPhoneNumberId,
      });
      return;
    }

    await sendWhatsAppTextMessage({
      to: params.senderPhone,
      body: copy.adjustmentApprovedMsg(order.code),
      senderPhoneNumberId: params.senderPhoneNumberId,
    });
  } else {
    const res = await declineCustomerPriceAdjustment(
      order.id,
      order.customerId,
      "app",
      "Ajustement de prix refusé par le client sur WhatsApp"
    );
    if (!res.ok) {
      await sendWhatsAppTextMessage({
        to: params.senderPhone,
        body: `⚠️ ${res.error}`,
        senderPhoneNumberId: params.senderPhoneNumberId,
      });
      return;
    }

    await sendWhatsAppTextMessage({
      to: params.senderPhone,
      body: copy.adjustmentRejectedMsg(order.code),
      senderPhoneNumberId: params.senderPhoneNumberId,
    });
  }
}

/**
 * Handles a single inbound WhatsApp message (text, interactive button/list reply, or GPS location pin).
 */
export async function handleInboundWhatsAppMessage(params: {
  message: WhatsAppInboundMessage;
  senderPhoneNumberId?: string;
  contactName?: string;
}): Promise<Result<{ handled: boolean; duplicate?: boolean }, string>> {
  const { message, senderPhoneNumberId, contactName } = params;

  // 1. Idempotency check by WAMID
  const isNew = await claimInboundWhatsAppMessage(message.id);
  if (!isNew) {
    return ok({ handled: false, duplicate: true });
  }

  try {
    // 2. Open 24h Customer Service Window & send read receipt + typing indicator
    await recordCustomerServiceWindowOpen(message.from);
    await markWhatsAppMessageReadAndTyping(message.id, senderPhoneNumberId).catch(
      () => {}
    );

    const session = await getWhatsAppBotSession(message.from);
    if (contactName && !session.customerName) {
      session.customerName = contactName;
      await saveWhatsAppBotSession(session);
    }

  // 3. Handle GPS Location Pin Drops
  if (message.type === "location" && message.location) {
    const { latitude, longitude, name, address } = message.location;
    const labelParts = [name, address].filter(Boolean).join(" - ");
    const gpsLandmark = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}${
      labelParts ? ` (${labelParts})` : ""
    }`;

    if (session.step === "CAPTURING_LANDMARK") {
      await promptOrderConfirmation(session, gpsLandmark, senderPhoneNumberId);
      return ok({ handled: true });
    }

    const activeOrder = await getLatestActiveOrderByPhone(message.from);
    if (activeOrder) {
      const updateRes = await updateOrderLandmarkWithGps({
        orderId: activeOrder.id,
        latitude,
        longitude,
        addressLabel: labelParts || null,
        actorId: activeOrder.customerId,
      });
      if (updateRes.ok) {
        const copy = getBotCopy(session.locale);
        await sendWhatsAppTextMessage({
          to: session.phone,
          body: copy.gpsLandmarkSavedForActiveOrder(
            activeOrder.code,
            updateRes.value.updatedLandmark
          ),
          senderPhoneNumberId,
        });
        return ok({ handled: true });
      }
    }

    await sendWelcomePrompt(session, senderPhoneNumberId);
    return ok({ handled: true });
  }

  // 4. Handle Interactive Button / List Replies
  const actionId = extractInteractiveActionId(message);
  if (actionId) {
    if (actionId.startsWith("ADJUSTMENT_APPROVE:")) {
      const orderId = actionId.slice("ADJUSTMENT_APPROVE:".length);
      await handlePriceAdjustmentAction({
        action: "approve",
        orderId,
        senderPhone: session.phone,
        locale: session.locale,
        senderPhoneNumberId,
      });
      return ok({ handled: true });
    }

    if (actionId.startsWith("ADJUSTMENT_REJECT:")) {
      const orderId = actionId.slice("ADJUSTMENT_REJECT:".length);
      await handlePriceAdjustmentAction({
        action: "reject",
        orderId,
        senderPhone: session.phone,
        locale: session.locale,
        senderPhoneNumberId,
      });
      return ok({ handled: true });
    }

    if (actionId.startsWith("SET_LOCALE:")) {
      const loc = actionId.slice("SET_LOCALE:".length);
      session.locale = loc === "sw" ? "sw" : loc === "en" ? "en" : "fr";
      await saveWhatsAppBotSession(session);
      await sendWelcomePrompt(session, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId === "START_ORDER") {
      session.items = [];
      await promptSelectNeighborhood(session, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("SELECT_NEIGHBORHOOD:")) {
      const neighborhoodId = actionId.slice("SELECT_NEIGHBORHOOD:".length);
      await promptSelectHouse(session, neighborhoodId, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("SELECT_HOUSE:")) {
      const houseId = actionId.slice("SELECT_HOUSE:".length);
      await promptSelectService(session, houseId, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("SELECT_SERVICE:")) {
      const serviceId = actionId.slice("SELECT_SERVICE:".length);
      await promptSelectItems(session, serviceId, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("SELECT_ITEM:")) {
      const houseItemId = actionId.slice("SELECT_ITEM:".length);
      await promptSelectQuantity(session, houseItemId, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("QTY:")) {
      const qty = parseInt(actionId.slice("QTY:".length), 10);
      await handleQuantityChosen(session, qty, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId === "MORE_ITEMS") {
      if (session.selectedServiceId) {
        await promptSelectItems(
          session,
          session.selectedServiceId,
          senderPhoneNumberId
        );
      } else if (session.houseId) {
        await promptSelectService(session, session.houseId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      return ok({ handled: true });
    }

    if (actionId === "CHANGE_SERVICE") {
      if (session.houseId) {
        await promptSelectService(session, session.houseId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      return ok({ handled: true });
    }

    if (actionId === "PROCEED_SLOTS") {
      await promptSelectSlot(session, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId.startsWith("SELECT_SLOT:")) {
      const idx = parseInt(actionId.slice("SELECT_SLOT:".length), 10);
      await promptCaptureLandmark(session, idx, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId === "CONFIRM_ORDER") {
      await finalizeWhatsAppOrder(session, senderPhoneNumberId);
      return ok({ handled: true });
    }

    if (actionId === "CANCEL_ORDER") {
      const copy = getBotCopy(session.locale);
      await clearWhatsAppBotSession(session.phone);
      await sendWhatsAppTextMessage({
        to: session.phone,
        body: copy.orderCancelledMsg,
        senderPhoneNumberId,
      });
      return ok({ handled: true });
    }
  }

  // 5. Handle Plain Text Messages
  const rawText = message.text?.body?.trim() || "";
  const lowerText = rawText.toLowerCase();

  if (rawText && RESET_KEYWORDS.has(lowerText)) {
    await clearWhatsAppBotSession(session.phone);
    const freshSession = await getWhatsAppBotSession(session.phone);
    await sendWelcomePrompt(freshSession, senderPhoneNumberId);
    return ok({ handled: true });
  }

  if (session.step === "SELECTING_QUANTITY") {
    const parsedQty = parseInt(rawText, 10);
    if (!Number.isNaN(parsedQty) && parsedQty >= 1 && parsedQty <= 50) {
      await handleQuantityChosen(session, parsedQty, senderPhoneNumberId);
      return ok({ handled: true });
    }
  }

  if (session.step === "CAPTURING_LANDMARK" && rawText.length >= 3) {
    await promptOrderConfirmation(session, rawText, senderPhoneNumberId);
    return ok({ handled: true });
  }

    // Preserve the current session and replay the appropriate prompt
    await replayCurrentStepPrompt(session, senderPhoneNumberId);
    return ok({ handled: true });
  } catch (error) {
    await unclaimInboundWhatsAppMessage(message.id);
    return err(
      error instanceof Error ? error.message : "Failed to handle inbound message"
    );
  }
}

/**
 * Replays the prompt corresponding to the customer's current session step without resetting state.
 */
async function replayCurrentStepPrompt(
  session: WhatsAppBotSession,
  senderPhoneNumberId?: string
): Promise<void> {
  const copy = getBotCopy(session.locale);
  if (session.step === "IDLE") {
    await sendWelcomePrompt(session, senderPhoneNumberId);
    return;
  }

  await sendWhatsAppTextMessage({
    to: session.phone,
    body: copy.unknownCommandMsg,
    senderPhoneNumberId,
  });

  switch (session.step) {
    case "SELECTING_NEIGHBORHOOD":
      await promptSelectNeighborhood(session, senderPhoneNumberId);
      break;
    case "SELECTING_HOUSE":
      if (session.neighborhoodId) {
        await promptSelectHouse(session, session.neighborhoodId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      break;
    case "SELECTING_SERVICE":
      if (session.houseId) {
        await promptSelectService(session, session.houseId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      break;
    case "SELECTING_ITEMS":
      if (session.selectedServiceId) {
        await promptSelectItems(session, session.selectedServiceId, senderPhoneNumberId);
      } else if (session.houseId) {
        await promptSelectService(session, session.houseId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      break;
    case "SELECTING_QUANTITY":
      if (session.pendingHouseItemId) {
        await promptSelectQuantity(session, session.pendingHouseItemId, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      break;
    case "SELECTING_SLOT":
      await promptSelectSlot(session, senderPhoneNumberId);
      break;
    case "CAPTURING_LANDMARK":
      await sendWhatsAppTextMessage({
        to: session.phone,
        body: `${copy.captureLandmarkHeader}\n\n${copy.captureLandmarkBody(
          session.neighborhoodName || "Bukavu"
        )}`,
        senderPhoneNumberId,
      });
      break;
    case "CONFIRMING_ORDER":
      if (session.landmark) {
        await promptOrderConfirmation(session, session.landmark, senderPhoneNumberId);
      } else {
        await promptSelectNeighborhood(session, senderPhoneNumberId);
      }
      break;
    default:
      await sendWelcomePrompt(session, senderPhoneNumberId);
  }
}

/**
 * Processes an entire Meta WhatsApp Webhook payload (messages and statuses).
 */
export async function handleWhatsAppWebhookPayload(
  payload: WhatsAppWebhookPayload
): Promise<Result<{ processedMessages: number; processedStatuses: number }, string>> {
  if (payload.object !== "whatsapp_business_account") {
    return err("Unsupported webhook object type");
  }

  let processedMessages = 0;
  let processedStatuses = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      const senderPhoneNumberId = value.metadata?.phone_number_id;
      const contactName = value.contacts?.[0]?.profile?.name;

      for (const status of value.statuses ?? []) {
        if (status.id) {
          processedStatuses += 1;
        }
      }

      for (const message of value.messages ?? []) {
        const res = await handleInboundWhatsAppMessage({
          message,
          senderPhoneNumberId,
          contactName,
        });
        if (res.ok && res.value.handled) {
          processedMessages += 1;
        }
      }
    }
  }

  return ok({ processedMessages, processedStatuses });
}
