import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPlaceCustomerOrder = vi.fn();
const mockEstimateCustomerCart = vi.fn();
const mockGetCheckoutPickupSlots = vi.fn();
const mockApprovePriceAdjustment = vi.fn();
const mockDeclinePriceAdjustment = vi.fn();

const mockGetNeighborhoods = vi.fn();
const mockGetCustomerHousesList = vi.fn();
const mockGetCustomerHouseDetail = vi.fn();
const mockGetOrderById = vi.fn();
const mockGetUserByContactPhone = vi.fn();
const mockCreateGuestUser = vi.fn();
const mockGetLatestActiveOrderByPhone = vi.fn();
const mockUpdateOrderLandmarkWithGps = vi.fn();
const mockCreateNotification = vi.fn();

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getNeighborhoods: (...args: unknown[]) => mockGetNeighborhoods(...args),
    getCustomerHousesList: (...args: unknown[]) =>
      mockGetCustomerHousesList(...args),
    getCustomerHouseDetail: (...args: unknown[]) =>
      mockGetCustomerHouseDetail(...args),
    getOrderById: (...args: unknown[]) => mockGetOrderById(...args),
    getUserByContactPhone: (...args: unknown[]) =>
      mockGetUserByContactPhone(...args),
    createGuestUser: (...args: unknown[]) => mockCreateGuestUser(...args),
    getLatestActiveOrderByPhone: (...args: unknown[]) =>
      mockGetLatestActiveOrderByPhone(...args),
    updateOrderLandmarkWithGps: (...args: unknown[]) =>
      mockUpdateOrderLandmarkWithGps(...args),
    createNotification: (...args: unknown[]) => mockCreateNotification(...args),
  };
});

vi.mock("@/services/order", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/order")>();
  return {
    ...actual,
    placeCustomerOrder: (...args: unknown[]) => mockPlaceCustomerOrder(...args),
    estimateCustomerCart: (...args: unknown[]) =>
      mockEstimateCustomerCart(...args),
    getCheckoutPickupSlots: (...args: unknown[]) =>
      mockGetCheckoutPickupSlots(...args),
    approveCustomerPriceAdjustment: (...args: unknown[]) =>
      mockApprovePriceAdjustment(...args),
    declineCustomerPriceAdjustment: (...args: unknown[]) =>
      mockDeclinePriceAdjustment(...args),
  };
});

import {
  clearWhatsAppMemoryStores,
  executeAdminWhatsAppTest,
  getWhatsAppBotSession,
  getWhatsAppIntegrationStatus,
  handleInboundWhatsAppMessage,
  handleWhatsAppWebhookPayload,
  isCustomerServiceWindowOpen,
  normalizeWhatsAppPhone,
  recordCustomerServiceWindowOpen,
  sendWhatsAppBusinessSettlementNotice,
  sendWhatsAppConditionPhotoProof,
  sendWhatsAppCourierArrivalAlert,
  sendWhatsAppOrderStatusUpdate,
  sendWhatsAppPriceAdjustmentPrompt,
  simulateAdminWhatsAppBotStep,
  verifyWhatsAppWebhookChallenge,
  verifyWhatsAppWebhookSignature,
} from "../index";

describe("WhatsApp Cloud API Integration & Conversational Bot", () => {
  beforeEach(() => {
    clearWhatsAppMemoryStores();
    vi.clearAllMocks();

    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          messaging_product: "whatsapp",
          contacts: [{ input: "243991234567", wa_id: "243991234567" }],
          messages: [{ id: "wamid.mock_test_message_id_123" }],
        }),
      } as unknown as Response;
    });

    mockCreateNotification.mockImplementation(async (input) => ({
      id: "notif-1",
      ...input,
      createdAt: new Date(),
    }));

    mockGetNeighborhoods.mockResolvedValue([
      {
        id: "nb-ibanda",
        name: "La Botte",
        zoneId: "zone-ibanda",
        zoneName: "Ibanda",
        status: "served",
        pauseReason: null,
        pausedUntil: null,
        sortOrder: 1,
      },
    ]);

    mockGetCustomerHousesList.mockResolvedValue([
      {
        id: "house-rafiki",
        name: "Pressing Rafiki",
        slug: "pressing-rafiki",
        neighborhoodId: "nb-ibanda",
        neighborhoodName: "La Botte",
        zoneId: "zone-ibanda",
        zoneName: "Ibanda",
        minimumOrderAmount: 10000,
        minItemPriceCdf: 3000,
        isActive: true,
        isPaused: false,
        coveredNeighborhoodIds: ["nb-ibanda"],
      },
    ]);

    mockGetCustomerHouseDetail.mockResolvedValue({
      house: {
        id: "house-rafiki",
        name: "Pressing Rafiki",
        slug: "pressing-rafiki",
        minimumOrderAmount: 10000,
        isActive: true,
        isPaused: false,
      },
      services: [
        {
          id: "srv-wash",
          slug: "lessive-simple",
          nameFr: "Lessive & Repassage",
          nameSw: "Ufuaji na Pasi",
        },
      ],
      items: [
        {
          houseItemId: "hi-chemise",
          serviceId: "srv-wash",
          serviceSlug: "lessive-simple",
          serviceNameFr: "Lessive & Repassage",
          serviceNameSw: "Ufuaji na Pasi",
          itemId: "item-chemise",
          itemNameFr: "Chemise",
          itemNameSw: "Shati",
          itemCategory: "vetements",
          fabricId: "fab-coton",
          fabricNameFr: "Coton",
          fabricNameSw: "Pamba",
          priceCdf: 4000,
          currency: "CDF",
          isExcluded: false,
          exclusionNote: null,
        },
      ],
      exclusions: [],
      weeklyHours: [],
    });

    mockEstimateCustomerCart.mockResolvedValue({
      ok: true,
      value: {
        items: [
          {
            houseItemId: "hi-chemise",
            serviceId: "srv-wash",
            itemId: "item-chemise",
            fabricId: "fab-coton",
            quantity: 3,
            unitPrice: 4000,
            lineTotal: 12000,
          },
        ],
        itemsTotal: 12000,
        deliveryFee: 3000,
        totalDue: 15000,
        minimumOrderMet: true,
        minimumOrderAmount: 10000,
        missingAmount: 0,
        priceChanges: [],
      },
    });

    mockGetCheckoutPickupSlots.mockResolvedValue({
      slots: [
        {
          start: new Date("2026-11-06T06:00:00.000Z"),
          end: new Date("2026-11-06T08:00:00.000Z"),
        },
      ],
      nextAvailableSlot: null,
    });

    mockGetUserByContactPhone.mockResolvedValue(null);
    mockCreateGuestUser.mockResolvedValue({
      ok: true,
      value: {
        id: "usr_guest_wa_1",
        name: "Amina",
        contactPhone: "+243991234567",
      },
    });

    mockPlaceCustomerOrder.mockResolvedValue({
      ok: true,
      value: {
        orderId: "ord-wa-100",
        code: "ORD-20261105-4821",
        trackingToken: "trk-wa-100",
      },
    });

    mockGetOrderById.mockResolvedValue({
      id: "ord-wa-100",
      code: "ORD-20261105-4821",
      trackingToken: "trk-wa-100",
      customerId: "usr_guest_wa_1",
      customerPhone: "+243991234567",
      houseId: "house-rafiki",
      houseName: "Pressing Rafiki",
      totalDue: 15000,
      status: "price_adjusted",
    });
  });

  describe("1. Webhook Security & Phone Normalization", () => {
    it("verifies Meta GET webhook challenge when token and mode match", () => {
      const res = verifyWhatsAppWebhookChallenge({
        mode: "subscribe",
        token: "secret-verify-token",
        challenge: "challenge_987654",
        verifyToken: "secret-verify-token",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBe("challenge_987654");
      }
    });

    it("rejects Meta GET webhook challenge on wrong verify token", () => {
      const res = verifyWhatsAppWebhookChallenge({
        mode: "subscribe",
        token: "wrong-token",
        challenge: "challenge_987654",
        verifyToken: "secret-verify-token",
      });

      expect(res.ok).toBe(false);
    });

    it("verifies valid x-hub-signature-256 HMAC-SHA256 signature and rejects tampered payloads", () => {
      const appSecret = "my_meta_app_secret_key";
      const rawBody = JSON.stringify({ object: "whatsapp_business_account" });
      const validHash = crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex");

      expect(
        verifyWhatsAppWebhookSignature(rawBody, `sha256=${validHash}`, appSecret)
      ).toBe(true);

      expect(
        verifyWhatsAppWebhookSignature(
          `${rawBody}tampered`,
          `sha256=${validHash}`,
          appSecret
        )
      ).toBe(false);

      expect(
        verifyWhatsAppWebhookSignature(rawBody, "sha256=deadbeef", appSecret)
      ).toBe(false);
    });

    it("rejects unsupported webhook object types in handleWhatsAppWebhookPayload", async () => {
      const res = await handleWhatsAppWebhookPayload({
        object: "page" as "whatsapp_business_account",
        entry: [],
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Unsupported webhook object type");
      }
    });

    it("normalizes DRC phone numbers into international digits format", () => {
      expect(normalizeWhatsAppPhone("0991234567")).toBe("243991234567");
      expect(normalizeWhatsAppPhone("+243 991 234 567")).toBe("243991234567");
    });
  });

  describe("2. Outbound Order, Courier Arrival & Settlement Notifications", () => {
    it("sends order status updates and records whatsapp_link notification in DB", async () => {
      await recordCustomerServiceWindowOpen("+243991234567");
      expect(await isCustomerServiceWindowOpen("243991234567")).toBe(true);

      const res = await sendWhatsAppOrderStatusUpdate({
        orderId: "ord-wa-100",
        orderCode: "ORD-20261105-4821",
        trackingToken: "trk-wa-100",
        customerUserId: "usr_guest_wa_1",
        customerPhone: "+243991234567",
        houseName: "Pressing Rafiki",
        status: "order_accepted",
      });

      expect(res.ok).toBe(true);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "ord-wa-100",
          channel: "whatsapp_link",
          templateKey: "order_accepted",
        })
      );
    });

    it("sends courier arrival alerts with 4-digit delivery verification code", async () => {
      const res = await sendWhatsAppCourierArrivalAlert({
        orderId: "ord-wa-100",
        orderCode: "ORD-20261105-4821",
        customerPhone: "+243991234567",
        courierName: "Justin",
        leg: "delivery",
        verificationCode: "4821",
      });

      expect(res.ok).toBe(true);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          templateKey: "delivery_arrived",
          body: expect.stringContaining("4821"),
        })
      );
    });

    it("sends interactive 2-button price adjustment approval prompt", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      const res = await sendWhatsAppPriceAdjustmentPrompt({
        orderId: "ord-wa-100",
        orderCode: "ORD-20261105-4821",
        customerPhone: "+243991234567",
        houseName: "Pressing Rafiki",
        diffAmountCdf: 4000,
        reason: "1 veste supplémentaire",
      });

      expect(res.ok).toBe(true);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          templateKey: "price_adjusted",
        })
      );

      const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
      const sentPayload = JSON.parse(lastCall[1]?.body as string);
      expect(sentPayload.template.components).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "button",
            sub_type: "quick_reply",
            index: 0,
            parameters: [
              {
                type: "payload",
                payload: "ADJUSTMENT_APPROVE:ord-wa-100",
              },
            ],
          }),
          expect.objectContaining({
            type: "button",
            sub_type: "quick_reply",
            index: 1,
            parameters: [
              {
                type: "payload",
                payload: "ADJUSTMENT_REJECT:ord-wa-100",
              },
            ],
          }),
        ])
      );
    });

    it("sends partner business settlement payout notification without customer PII", async () => {
      const res = await sendWhatsAppBusinessSettlementNotice({
        houseId: "house-rafiki",
        houseName: "Pressing Rafiki",
        contactPhone: "+243997654321",
        amount: 145000,
        currency: "CDF",
        reference: "STL-2026-08",
        method: "mobile_money",
        period: "2026-W45",
      });

      expect(res.ok).toBe(true);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          templateKey: "partner_settlement_paid",
          phone: "+243997654321",
        })
      );
    });

    it("forwards Cloudflare R2 condition proof photos over WhatsApp", async () => {
      const res = await sendWhatsAppConditionPhotoProof({
        orderId: "ord-wa-100",
        orderCode: "ORD-20261105-4821",
        customerPhone: "+243991234567",
        imageUrl: "https://safihub.com/api/storage/photos/tear-1.webp",
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("3. Conversational Ordering Bot End-to-End Flow", () => {
    const customerPhone = "243991234567";

    it("deduplicates repeated webhook deliveries with the same WAMID", async () => {
      const first = await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.dup_test_1",
          from: customerPhone,
          timestamp: "1762350000",
          type: "text",
          text: { body: "Bonjour" },
        },
        contactName: "Amina",
      });

      const second = await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.dup_test_1",
          from: customerPhone,
          timestamp: "1762350000",
          type: "text",
          text: { body: "Bonjour" },
        },
        contactName: "Amina",
      });

      expect(first.ok && first.value.handled).toBe(true);
      expect(second.ok && second.value.duplicate).toBe(true);
    });

    it("walks customer from neighborhood -> house -> service -> item -> quantity -> slot -> landmark -> canonical order creation", async () => {
      // Step 1: User starts order
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_1",
          from: customerPhone,
          timestamp: "1762350001",
          type: "interactive",
          interactive: {
            type: "button_reply",
            button_reply: { id: "START_ORDER", title: "Commander" },
          },
        },
        contactName: "Amina",
      });

      let session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_NEIGHBORHOOD");

      // Step 2: User selects neighborhood "La Botte"
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_2",
          from: customerPhone,
          timestamp: "1762350002",
          type: "interactive",
          interactive: {
            type: "list_reply",
            list_reply: {
              id: "SELECT_NEIGHBORHOOD:nb-ibanda",
              title: "La Botte",
            },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_HOUSE");
      expect(session.neighborhoodId).toBe("nb-ibanda");

      // Step 3: User selects house "Pressing Rafiki"
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_3",
          from: customerPhone,
          timestamp: "1762350003",
          type: "interactive",
          interactive: {
            type: "list_reply",
            list_reply: {
              id: "SELECT_HOUSE:house-rafiki",
              title: "Pressing Rafiki",
            },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_SERVICE");
      expect(session.houseId).toBe("house-rafiki");

      // Step 4: User selects service "Lessive & Repassage"
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_4",
          from: customerPhone,
          timestamp: "1762350004",
          type: "interactive",
          interactive: {
            type: "list_reply",
            list_reply: {
              id: "SELECT_SERVICE:srv-wash",
              title: "Lessive & Repassage",
            },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_ITEMS");

      // Step 5: User selects item "Chemise"
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_5",
          from: customerPhone,
          timestamp: "1762350005",
          type: "interactive",
          interactive: {
            type: "list_reply",
            list_reply: {
              id: "SELECT_ITEM:hi-chemise",
              title: "Chemise",
            },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_QUANTITY");

      // Step 6: User chooses quantity 3
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_6",
          from: customerPhone,
          timestamp: "1762350006",
          type: "interactive",
          interactive: {
            type: "button_reply",
            button_reply: { id: "QTY:3", title: "3" },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.items).toHaveLength(1);
      expect(session.items[0]?.quantity).toBe(3);

      // Step 7: User proceeds to pickup slots
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_7",
          from: customerPhone,
          timestamp: "1762350007",
          type: "interactive",
          interactive: {
            type: "button_reply",
            button_reply: { id: "PROCEED_SLOTS", title: "Choisir créneau" },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("SELECTING_SLOT");

      // Step 8: User selects slot 0
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_8",
          from: customerPhone,
          timestamp: "1762350008",
          type: "interactive",
          interactive: {
            type: "list_reply",
            list_reply: { id: "SELECT_SLOT:0", title: "08:00 - 10:00" },
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("CAPTURING_LANDMARK");

      // Step 9: User sends GPS location pin as their landmark
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_9",
          from: customerPhone,
          timestamp: "1762350009",
          type: "location",
          location: {
            latitude: -2.5021,
            longitude: 28.8642,
            name: "Avenue Gouverneur",
            address: "Portail Bleu, La Botte",
          },
        },
      });

      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("CONFIRMING_ORDER");
      expect(session.landmark).toContain("GPS: -2.502100, 28.864200");

      // Step 10: User clicks Confirm Order -> calls placeCustomerOrder with source: "whatsapp"
      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.step_10",
          from: customerPhone,
          timestamp: "1762350010",
          type: "interactive",
          interactive: {
            type: "button_reply",
            button_reply: { id: "CONFIRM_ORDER", title: "Confirmer commande" },
          },
        },
      });

      expect(mockPlaceCustomerOrder).toHaveBeenCalledTimes(1);
      expect(mockPlaceCustomerOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "usr_guest_wa_1",
          houseId: "house-rafiki",
          customerNeighborhoodId: "nb-ibanda",
          source: "whatsapp",
          items: [
            expect.objectContaining({
              houseItemId: "hi-chemise",
              quantity: 3,
            }),
          ],
        })
      );

      // Session should be reset to IDLE after order creation
      session = await getWhatsAppBotSession(customerPhone);
      expect(session.step).toBe("IDLE");
      expect(session.items).toHaveLength(0);
    });
  });

  describe("4. Interactive Price Adjustment & Active Order GPS Pin Drops", () => {
    it("approves price adjustment when customer clicks ADJUSTMENT_APPROVE button", async () => {
      mockApprovePriceAdjustment.mockResolvedValue({ ok: true, value: undefined });

      await handleWhatsAppWebhookPayload({
        object: "whatsapp_business_account",
        entry: [
          {
            id: "waba-1",
            changes: [
              {
                field: "messages",
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "243990000000",
                    phone_number_id: "phone-id-1",
                  },
                  messages: [
                    {
                      id: "wamid.adj_approve_1",
                      from: "243991234567",
                      timestamp: "1762350100",
                      type: "interactive",
                      interactive: {
                        type: "button_reply",
                        button_reply: {
                          id: "ADJUSTMENT_APPROVE:ord-wa-100",
                          title: "Accepter",
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

      expect(mockApprovePriceAdjustment).toHaveBeenCalledWith(
        "ord-wa-100",
        "usr_guest_wa_1",
        "app"
      );
    });

    it("attaches GPS location pin to customer's active order when sent outside checkout flow", async () => {
      mockGetLatestActiveOrderByPhone.mockResolvedValue({
        id: "ord-wa-100",
        code: "ORD-20261105-4821",
        customerId: "usr_guest_wa_1",
        customerPhone: "+243991234567",
      });
      mockUpdateOrderLandmarkWithGps.mockResolvedValue({
        ok: true,
        value: {
          updatedLandmark: "Près Pharmacie | GPS: -2.502000, 28.864000",
        },
      });

      await handleInboundWhatsAppMessage({
        message: {
          id: "wamid.gps_active_1",
          from: "243991234567",
          timestamp: "1762350200",
          type: "location",
          location: {
            latitude: -2.502,
            longitude: 28.864,
            name: "Pharmacie La Botte",
          },
        },
      });

      expect(mockUpdateOrderLandmarkWithGps).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "ord-wa-100",
          latitude: -2.502,
          longitude: 28.864,
        })
      );
    });
  });

  describe("5. Admin WhatsApp Test Console Runner & Bot Simulator", () => {
    it("returns integration status and dispatches admin test scenarios", async () => {
      const status = getWhatsAppIntegrationStatus();
      expect(status.apiVersion).toBe("v23.0");
      expect(status.webhookUrl).toContain("/api/webhooks/whatsapp");

      const testRes = await executeAdminWhatsAppTest({
        scenario: "order_status",
        recipientPhone: "0991234567",
        locale: "fr",
        orderCode: "ORD-TEST-001",
        houseName: "Pressing Rafiki",
      });

      expect(testRes.ok).toBe(true);
      if (testRes.ok) {
        expect(testRes.value.scenario).toBe("order_status");
        expect(testRes.value.recipientPhone).toBe("243991234567");
      }
    });

    it("simulates interactive bot steps and resets session from admin console", async () => {
      const startRes = await simulateAdminWhatsAppBotStep({
        phone: "0991234567",
        actionType: "button",
        value: "START_ORDER",
      });

      expect(startRes.ok).toBe(true);
      if (startRes.ok) {
        expect(startRes.value.step).toBe("SELECTING_NEIGHBORHOOD");
      }

      const resetRes = await simulateAdminWhatsAppBotStep({
        phone: "0991234567",
        actionType: "reset",
      });

      expect(resetRes.ok).toBe(true);
      if (resetRes.ok) {
        expect(resetRes.value.step).toBe("IDLE");
      }
    });
  });
});

