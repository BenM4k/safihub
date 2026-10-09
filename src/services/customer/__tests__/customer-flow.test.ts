import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  submitCoverageRequest,
  getCustomerNeighborhoods,
} from "@/services/coverage/customer-coverage.service";
import {
  getCustomerAccountData,
  updateCustomerProfileInfo,
  addCustomerAddress,
  removeCustomerAddress,
  makeDefaultCustomerAddress,
  saveCustomerConsent,
} from "@/services/customer/account.service";
import {
  getCustomerHousesData,
} from "@/services/house/customer-search.service";
import {
  estimateCustomerCart,
  placeCustomerOrder,
  cancelCustomerOrder,
  approveCustomerPriceAdjustment,
  declineCustomerPriceAdjustment,
  confirmCustomerDeliverySlot,
  openCustomerOrderDispute,
  getPublicTrackingOrder,
} from "@/services/order";

// Mock DAL layers
vi.mock("@/dal/coverage.dal", () => ({
  createCoverageRequest: vi.fn(async (input) => ({
    id: "cov_req_123",
    neighborhoodId: input.neighborhoodId ?? null,
    neighborhoodText: input.neighborhoodText ?? null,
    phone: input.phone,
    userId: input.userId ?? null,
    notifiedAt: null,
    createdAt: new Date(),
  })),
  getNeighborhoods: vi.fn(async () => [
    { id: "n_ibanda", name: "La Botte", zoneId: "z_ibanda", status: "served" as const, pauseReason: null, pausedUntil: null, sortOrder: 1 },
    { id: "n_kadutu", name: "Kadutu Centre", zoneId: "z_kadutu", status: "served" as const, pauseReason: null, pausedUntil: null, sortOrder: 2 },
    { id: "n_bagira", name: "Bagira Centre", zoneId: "z_bagira", status: "not_served" as const, pauseReason: null, pausedUntil: null, sortOrder: 3 },
  ]),
}));

vi.mock("@/dal/auth.dal", () => ({
  getUserById: vi.fn(async (id: string) => ({
    id,
    name: "Jean Bahati",
    email: "jean@example.com",
    role: "customer",
    contactPhone: "+243999000123",
    createdAt: new Date(),
  })),
  getUserConsents: vi.fn(async () => [
    { id: "c1", document: "terms" as const, version: "1.0", acceptedAt: new Date() },
    { id: "c2", document: "privacy" as const, version: "1.0", acceptedAt: new Date() },
    { id: "c3", document: "photos" as const, version: "1.0", acceptedAt: new Date() },
  ]),
  recordConsent: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/dal/customer-account.dal", () => {
  interface MockAddress {
    id: string;
    userId: string;
    label: string | null;
    neighborhoodId: string;
    neighborhoodName?: string | null;
    landmark: string;
    phone: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }

  let addresses: MockAddress[] = [
    {
      id: "addr_1",
      userId: "cust_123",
      label: "Maison",
      neighborhoodId: "n_ibanda",
      neighborhoodName: "La Botte",
      landmark: "Avenue Maniema 12",
      phone: "+243999000123",
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    updateCustomerProfile: vi.fn(async (id: string, data: { name?: string; contactPhone?: string }) => ({
      id,
      name: data.name ?? "Jean Bahati",
      email: "jean@example.com",
      role: "customer",
      contactPhone: data.contactPhone ?? "+243999000123",
      createdAt: new Date(),
    })),
    getCustomerAddresses: vi.fn(async () => addresses),
    createCustomerAddress: vi.fn(async (data: { userId: string; label?: string | null; neighborhoodId: string; landmark: string; phone: string; isDefault?: boolean }) => {
      const newAddr: MockAddress = {
        id: "addr_2",
        userId: data.userId,
        label: data.label ?? null,
        neighborhoodId: data.neighborhoodId,
        neighborhoodName: "Kadutu Centre",
        landmark: data.landmark,
        phone: data.phone,
        isDefault: data.isDefault ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addresses.push(newAddr);
      return newAddr;
    }),
    updateCustomerAddress: vi.fn(async (id: string, _userId: string, data: Partial<typeof addresses[0]>) => {
      const idx = addresses.findIndex((a) => a.id === id);
      if (idx >= 0) {
        addresses[idx] = { ...addresses[idx]!, ...data };
        return addresses[idx]!;
      }
      return null;
    }),
    deleteCustomerAddress: vi.fn(async (id: string) => {
      addresses = addresses.filter((a) => a.id !== id);
      return true;
    }),
    setDefaultCustomerAddress: vi.fn(async (id: string) => {
      addresses.forEach((a) => (a.isDefault = a.id === id));
      return true;
    }),
    getUserConsents: vi.fn(async () => [
      { id: "c1", document: "terms" as const, version: "1.0", acceptedAt: new Date() },
      { id: "c2", document: "privacy" as const, version: "1.0", acceptedAt: new Date() },
      { id: "c3", document: "photos" as const, version: "1.0", acceptedAt: new Date() },
    ]),
    recordConsent: vi.fn(async () => ({ ok: true })),
  };
});

vi.mock("@/dal/customer-houses.dal", () => ({
  getCustomerHousesList: vi.fn(async () => [
    {
      id: "h_ibanda",
      name: "Pressing du Lac",
      neighborhoodId: "n_ibanda",
      neighborhoodName: "La Botte",
      zoneId: "z_ibanda",
      zoneName: "Ibanda",
      addressNote: "Av. Maniema",
      minimumOrderAmount: 5000,
      turnaroundHours: 24,
      dailyCapacity: 20,
      cutoffMinutes: 60,
      isActive: true,
      isPaused: false,
      pausedUntil: null,
      isOpenNow: true,
      todayHoursText: "08:00 - 18:00",
      minItemPriceCdf: 2500,
      availableServices: [{ id: "s1", slug: "wash", nameFr: "Lavage", nameSw: "Kufua" }],
      coveredNeighborhoodIds: ["n_ibanda"],
      rating: 4.8,
      reviewCount: 45,
      imageUrl: null,
      coords: null,
    },
    {
      id: "h_kadutu",
      name: "Pressing Kadutu",
      neighborhoodId: "n_kadutu",
      neighborhoodName: "Kadutu Centre",
      zoneId: "z_kadutu",
      zoneName: "Kadutu",
      addressNote: "Rond-point",
      minimumOrderAmount: 3000,
      turnaroundHours: 48,
      dailyCapacity: 15,
      cutoffMinutes: 60,
      isActive: true,
      isPaused: false,
      pausedUntil: null,
      isOpenNow: true,
      todayHoursText: "08:00 - 18:00",
      minItemPriceCdf: 2000,
      availableServices: [{ id: "s1", slug: "wash", nameFr: "Lavage", nameSw: "Kufua" }],
      coveredNeighborhoodIds: ["n_kadutu"],
      rating: 4.5,
      reviewCount: 20,
      imageUrl: null,
      coords: null,
    },
  ]),
  getZones: vi.fn(async () => [
    { id: "z_ibanda", name: "Ibanda", description: null, isActive: true },
    { id: "z_kadutu", name: "Kadutu", description: null, isActive: true },
  ]),
  getZoneFees: vi.fn(async () => [
    { customerZoneId: "z_ibanda", houseZoneId: "z_ibanda", deliveryFee: 2000 },
    { customerZoneId: "z_kadutu", houseZoneId: "z_ibanda", deliveryFee: 3500 },
  ]),
}));

vi.mock("@/services/order/context", () => ({
  buildOrderValidationContext: vi.fn(async (params?: { customerId?: string; idempotencyKey?: string }) => {
    const existingOrders = [];
    if (params?.customerId && params?.idempotencyKey) {
      for (const ord of mockOrdersDb.values()) {
        if (ord.customerId === params.customerId && ord.idempotencyKey === params.idempotencyKey) {
          existingOrders.push({
            id: ord.id,
            code: ord.code,
            idempotencyKey: ord.idempotencyKey,
            customerId: ord.customerId,
          });
        }
      }
    }

    return {
      houses: new Map([
        [
          "h_ibanda",
          {
            id: "h_ibanda",
            name: "Pressing du Lac",
            neighborhoodId: "n_ibanda",
            minimumOrderAmount: 5000,
            dailyCapacity: 20,
            turnaroundHours: 24,
            cutoffMinutes: 60,
            isActive: true,
            isPaused: false,
            commissionBps: 1500,
            phone: "+243999111222",
          },
        ],
      ]),
      neighborhoods: new Map([
        ["n_ibanda", { id: "n_ibanda", name: "La Botte", zoneId: "z_ibanda", isActive: true, isCovered: true }],
        ["n_kadutu", { id: "n_kadutu", name: "Kadutu Centre", zoneId: "z_kadutu", isActive: true, isCovered: true }],
      ]),
      houseCoverages: [{ houseId: "h_ibanda", neighborhoodId: "n_ibanda", isActive: true }],
      houseCoverage: [{ houseId: "h_ibanda", neighborhoodId: "n_ibanda", isActive: true }],
      houseItems: [
        {
          id: "hi_shirt",
          houseId: "h_ibanda",
          serviceId: "s_wash",
          itemId: "item_shirt",
          fabricId: "fab_cotton",
          price: 3000,
          isActive: true,
        },
        {
          id: "hi_suit",
          houseId: "h_ibanda",
          serviceId: "s_dry",
          itemId: "item_suit",
          fabricId: "fab_wool",
          price: 8000,
          isActive: true,
        },
      ],
      zoneFees: [
        { id: "zf1", customerZoneId: "z_ibanda", houseZoneId: "z_ibanda", deliveryFee: 2000 },
      ],
      houseHours: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
        houseId: "h_ibanda",
        weekday,
        opensAt: "08:00",
        closesAt: "19:00",
      })),
      houseClosures: [],
      courierShifts: [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
        courierId: "courier_1",
        weekday,
        startsAt: "07:00",
        endsAt: "20:00",
      })),
      settings: {
        maxItemsPerOrder: 50,
        defaultCommissionBps: 1500,
        maxCoverageDistanceLevel: 3,
        acceptanceDelayMinutes: 45,
        leadTimeMinutes: 30,
      },
      existingOrdersCount: 2,
      existingOrders,
      masterItems: new Map([["item_shirt", { id: "item_shirt", isActive: true }]]),
      masterFabrics: new Map([["fab_cotton", { id: "fab_cotton", isActive: true }]]),
      masterServices: new Map([["s_wash", { id: "s_wash", isActive: true }]]),
    };
  }),
}));

// Mock DAL order methods
interface MockOrderRecord {
  id: string;
  customerId?: string;
  status?: string;
  code?: string;
  trackingToken?: string;
  deliveryConfirmationCode?: string | null;
  houseId?: string;
  totalDue?: number;
  idempotencyKey?: string;
  deliverySlotStart?: Date | null;
  deliverySlotEnd?: Date | null;
  [key: string]: unknown;
}

interface MockEventRecord {
  id: string;
  orderId?: string;
  fromStatus?: string | null;
  toStatus?: string;
  [key: string]: unknown;
}

const mockOrdersDb = new Map<string, MockOrderRecord>();
const mockEventsDb: MockEventRecord[] = [];

vi.mock("@/dal/order.dal", () => ({
  getOrderById: vi.fn(async (id: string) => mockOrdersDb.get(id) || null),
  getOrderEvents: vi.fn(async (orderId: string) =>
    mockEventsDb.filter((e) => e.orderId === orderId)
  ),
  getOrderItems: vi.fn(async () => [
    {
      id: "oi_1",
      orderId: "ord_1",
      houseItemId: "hi_shirt",
      serviceId: "s_wash",
      itemId: "item_shirt",
      fabricId: "fab_cotton",
      itemNameFr: "Chemise",
      fabricNameFr: "Coton",
      serviceNameFr: "Lavage",
      customLabel: null,
      declaredQuantity: 2,
      pickupQuantity: 2,
      receivedQuantity: 3,
      unitPrice: 3000,
      conditionNote: null,
      isFlagged: true,
      status: "accepted" as const,
    },
  ]),
  getOrderByTrackingToken: vi.fn(async (token: string) => {
    for (const ord of mockOrdersDb.values()) {
      if (ord.trackingToken === token) return ord;
    }
    return null;
  }),
  transitionOrderStatusAtomic: vi.fn(
    async ({
      orderId,
      newStatus,
      event,
    }: {
      orderId: string;
      newStatus: string;
      event: Record<string, unknown>;
    }) => {
      const ord = mockOrdersDb.get(orderId);
      if (ord) {
        ord.status = newStatus;
        mockEventsDb.push({ id: `ev_${Date.now()}`, ...event });
        return true;
      }
      return false;
    }
  ),
  updateOrderDeliverySlot: vi.fn(
    async ({
      orderId,
      deliverySlotStart,
      deliverySlotEnd,
      newStatus,
      event,
    }: {
      orderId: string;
      deliverySlotStart: Date;
      deliverySlotEnd: Date;
      newStatus: string;
      event: Record<string, unknown>;
    }) => {
      const ord = mockOrdersDb.get(orderId);
      if (ord) {
        ord.status = newStatus;
        ord.deliverySlotStart = deliverySlotStart;
        ord.deliverySlotEnd = deliverySlotEnd;
      }
      mockEventsDb.push({ id: `ev_${Date.now()}`, ...event });
    }
  ),
  createDisputeTransaction: vi.fn(
    async ({
      orderId,
      event,
    }: {
      orderId: string;
      openedBy?: string;
      type?: string;
      description?: string;
      event: Record<string, unknown>;
    }) => {
      const ord = mockOrdersDb.get(orderId);
      if (ord) ord.status = "disputed";
      mockEventsDb.push({ id: `ev_${Date.now()}`, ...event });
      return { disputeId: "disp_999" };
    }
  ),
  insertOrderWithDetails: vi.fn(
    async ({
      order,
    }: {
      order: Record<string, unknown> & { id?: string; code: string; trackingToken: string };
    }) => {
      const id = order.id || `ord_${Date.now()}`;
      const saved = { ...order, id };
      mockOrdersDb.set(id, saved);
      return { orderId: id, code: order.code, trackingToken: order.trackingToken };
    }
  ),
  getOrderByCustomerAndIdempotencyKey: vi.fn(async (customerId: string, key: string) => {
    for (const ord of mockOrdersDb.values()) {
      if (ord.customerId === customerId && ord.idempotencyKey === key) return ord;
    }
    return null;
  }),
}));

describe("Phase 5 — Customer App End-to-End Workflows", () => {
  beforeEach(() => {
    mockOrdersDb.clear();
    mockEventsDb.length = 0;
  });

  describe("5.1 Landing & Coverage Requests (AC 17, AC 19)", () => {
    it("successfully creates a coverage request for an uncovered neighborhood", async () => {
      const res = await submitCoverageRequest({
        neighborhoodId: "n_bagira",
        phone: "+243999888777",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.id).toBe("cov_req_123");
        expect(res.value.notifiedAt).toBeNull();
      }
    });

    it("rejects invalid contact phone numbers", async () => {
      const res = await submitCoverageRequest({
        neighborhoodId: "n_bagira",
        phone: "12345", // invalid format
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("téléphone");
      }
    });

    it("lists covered and uncovered neighborhoods", async () => {
      const hoods = await getCustomerNeighborhoods();
      expect(hoods.length).toBe(3);
      const covered = hoods.filter((h) => h.status === "served");
      expect(covered.length).toBe(2);
    });
  });

  describe("5.2 Customer Account & Consents", () => {
    it("retrieves customer profile, saved addresses, and legal consents history", async () => {
      const res = await getCustomerAccountData("cust_123");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.user.name).toBe("Jean Bahati");
        expect(res.value.addresses.length).toBeGreaterThan(0);
        expect(res.value.consents.length).toBe(3);
        const consentTypes = res.value.consents.map((c) => c.document);
        expect(consentTypes).toContain("terms");
        expect(consentTypes).toContain("privacy");
        expect(consentTypes).toContain("photos");
      }
    });

    it("updates customer contact phone", async () => {
      const res = await updateCustomerProfileInfo("cust_123", {
        name: "Jean Bahati Mulemangabo",
        contactPhone: "+243888777666",
      });

      expect(res.ok).toBe(true);
    });

    it("creates, sets default, and deletes saved addresses", async () => {
      const createRes = await addCustomerAddress("cust_123", {
        label: "Bureau",
        neighborhoodId: "n_kadutu",
        landmark: "Rond-point Carrefour",
        phone: "+243999000123",
        isDefault: false,
      });

      expect(createRes.ok).toBe(true);

      const defRes = await makeDefaultCustomerAddress("cust_123", "addr_2");
      expect(defRes.ok).toBe(true);

      const delRes = await removeCustomerAddress("cust_123", "addr_2");
      expect(delRes.ok).toBe(true);
    });

    it("saves customer consent with versioning", async () => {
      const res = await saveCustomerConsent("cust_123", "terms", "1.0");
      expect(res.ok).toBe(true);
    });
  });

  describe("5.3 Houses List & Neighborhood Filtering (AC 18)", () => {
    it("never lists a house that does not cover the selected neighborhood", async () => {
      const data = await getCustomerHousesData({
        neighborhoodId: "n_ibanda",
      });

      expect(data.houses.length).toBe(1);
      expect(data.houses[0]!.id).toBe("h_ibanda");
      // House 2 covers only n_kadutu and should NOT be listed
      expect(data.houses.some((h) => h.id === "h_kadutu")).toBe(false);
    });

    it("calculates estimated delivery fee for houses covering the neighborhood", async () => {
      const data = await getCustomerHousesData({
        neighborhoodId: "n_ibanda",
      });

      expect(data.houses[0]!.estimatedDeliveryFee).toBe(2000);
    });
  });

  describe("5.4 & 5.5 Cart Server-Side Estimation", () => {
    it("accurately calculates item totals, delivery fees, and minimum order compliance", async () => {
      const res = await estimateCustomerCart(
        "h_ibanda",
        [
          {
            houseItemId: "hi_shirt",
            serviceId: "s_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 2,
            expectedUnitPrice: 3000,
          },
        ],
        "n_ibanda"
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.itemsTotal).toBe(6000); // 2 * 3000
        expect(res.value.deliveryFee).toBe(2000);
        expect(res.value.totalDue).toBe(8000);
        expect(res.value.minimumOrderMet).toBe(true); // min 5000 <= 6000
        expect(res.value.missingAmount).toBe(0);
      }
    });

    it("detects price changes when expected price differs from house catalogue", async () => {
      const res = await estimateCustomerCart(
        "h_ibanda",
        [
          {
            houseItemId: "hi_shirt",
            serviceId: "s_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 1,
            expectedUnitPrice: 2500, // old price
          },
        ],
        "n_ibanda"
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.priceChanges.length).toBe(1);
        expect(res.value.priceChanges[0]!.oldPrice).toBe(2500);
        expect(res.value.priceChanges[0]!.newPrice).toBe(3000);
      }
    });

    it("flags missing amount when below minimum order threshold", async () => {
      const res = await estimateCustomerCart(
        "h_ibanda",
        [
          {
            houseItemId: "hi_shirt",
            serviceId: "s_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 1, // 3000 < min 5000
            expectedUnitPrice: 3000,
          },
        ],
        "n_ibanda"
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.minimumOrderMet).toBe(false);
        expect(res.value.missingAmount).toBe(2000);
      }
    });
  });

  describe("5.6 Checkout & Idempotency", () => {
    it("places order and guarantees idempotency on duplicate submissions (AC 3)", async () => {
      const idempotencyKey = "uuid-checkout-12345";
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pickupStart = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 8, 0));
      const pickupEnd = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 10, 0));

      const input = {
        houseId: "h_ibanda",
        customerId: "cust_123",
        customerNeighborhoodId: "n_ibanda",
        landmark: "Avenue Maniema 12",
        contactPhone: "+243999000123",
        pickupSlot: { start: pickupStart, end: pickupEnd },
        idempotencyKey,
        items: [
          {
            houseItemId: "hi_shirt",
            serviceId: "s_wash",
            itemId: "item_shirt",
            fabricId: "fab_cotton",
            quantity: 2,
            expectedUnitPrice: 3000,
          },
        ],
      };

      const res1 = await placeCustomerOrder(input);
      expect(res1.ok ? null : res1.error).toBeNull();

      // Duplicate submission with same idempotency key (simulating double tap)
      const res2 = await placeCustomerOrder(input);
      expect(res2.ok).toBe(true);
      if (res1.ok && res2.ok) {
        expect(res2.value.orderId).toBe(res1.value.orderId);
        expect(res2.value.code).toBe(res1.value.code);
      }
    });
  });

  describe("5.7 Order Cancellation Before Acceptance", () => {
    it("allows customer to cancel an order in created status", async () => {
      const order: MockOrderRecord = {
        id: "ord_cancel_test",
        customerId: "cust_123",
        status: "created",
        code: "SAF-1111",
        trackingToken: "tok-1111",
        houseId: "h_ibanda",
        totalDue: 8000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await cancelCustomerOrder(order.id, "cust_123", "Client changed mind");
      expect(res.ok).toBe(true);
      expect(order.status).toBe("cancelled");
    });

    it("rejects cancellation once house has accepted the order", async () => {
      const order: MockOrderRecord = {
        id: "ord_accepted_test",
        customerId: "cust_123",
        status: "accepted",
        code: "SAF-2222",
        trackingToken: "tok-2222",
        houseId: "h_ibanda",
        totalDue: 8000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await cancelCustomerOrder(order.id, "cust_123", "Too late");
      expect(res.ok).toBe(false);
      expect(order.status).toBe("accepted");
    });
  });

  describe("5.8 Price Adjustment & Delivery Slot Confirmation", () => {
    it("approves price adjustment in app and records approvalMethod as app", async () => {
      const order: MockOrderRecord = {
        id: "ord_adj_test",
        customerId: "cust_123",
        status: "price_adjusted",
        code: "SAF-3333",
        trackingToken: "tok-3333",
        houseId: "h_ibanda",
        totalDue: 9000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await approveCustomerPriceAdjustment(order.id, "cust_123", "app");
      expect(res.ok).toBe(true);
      expect(order.status).toBe("washing");

      const event = mockEventsDb.find((e) => e.orderId === order.id && e.toStatus === "washing");
      expect(event).toBeDefined();
      expect(event?.approvalMethod).toBe("app");
    });

    it("declines price adjustment in app and transitions order to price_declined", async () => {
      const order: MockOrderRecord = {
        id: "ord_dec_test",
        customerId: "cust_123",
        status: "price_adjusted",
        code: "SAF-4444",
        trackingToken: "tok-4444",
        houseId: "h_ibanda",
        totalDue: 9000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await declineCustomerPriceAdjustment(order.id, "cust_123", "app", "Trop cher");
      expect(res.ok).toBe(true);
      expect(order.status).toBe("price_declined");
    });

    it("confirms proposed delivery slot when order is ready", async () => {
      const order: MockOrderRecord = {
        id: "ord_ready_test",
        customerId: "cust_123",
        status: "ready",
        code: "SAF-5555",
        trackingToken: "tok-5555",
        houseId: "h_ibanda",
        totalDue: 8000,
        deliverySlotStart: null,
        deliverySlotEnd: null,
      };
      mockOrdersDb.set(order.id, order);

      const start = new Date(Date.now() + 24 * 3600 * 1000);
      const end = new Date(Date.now() + 26 * 3600 * 1000);

      const res = await confirmCustomerDeliverySlot(order.id, "cust_123", { start, end }, "app");
      expect(res.ok).toBe(true);
      expect(order.status).toBe("delivery_slot_confirmed");
      expect(order.deliverySlotStart).toEqual(start);
    });
  });

  describe("5.9 Public Guest Tracking Page", () => {
    it("retrieves order details via unguessable tracking token without authentication", async () => {
      const order: MockOrderRecord = {
        id: "ord_track_test",
        customerId: "guest_user_1",
        status: "delivery_in_progress",
        code: "SAF-7777",
        trackingToken: "secret-token-xyz-123456789",
        deliveryConfirmationCode: "4821",
        houseId: "h_ibanda",
        totalDue: 8000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await getPublicTrackingOrder("secret-token-xyz-123456789");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.order.code).toBe("SAF-7777");
        expect(res.value.order.deliveryConfirmationCode).toBe("4821");
        expect(res.value.items.length).toBeGreaterThan(0);
      }
    });

    it("fails cleanly when tracking token does not exist", async () => {
      const res = await getPublicTrackingOrder("non-existent-token");
      expect(res.ok).toBe(false);
    });
  });

  describe("5.10 Disputes", () => {
    it("opens dispute on order, records reason, and transitions order to disputed", async () => {
      const order: MockOrderRecord = {
        id: "ord_disp_test",
        customerId: "cust_123",
        status: "delivered",
        code: "SAF-8888",
        trackingToken: "tok-8888",
        houseId: "h_ibanda",
        totalDue: 8000,
      };
      mockOrdersDb.set(order.id, order);

      const res = await openCustomerOrderDispute(order.id, "cust_123", {
        type: "damage",
        description: "Une chemise blanche présente une décoloration rose",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.disputeId).toBe("disp_999");
      }
      expect(order.status).toBe("disputed");
    });
  });
});
