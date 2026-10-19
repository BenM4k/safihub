import { describe, expect, it, vi } from "vitest";
import {
  acceptPartnerOrder,
  getPartnerOrderDetail,
  handoverPartnerOrderToCourier,
  listPartnerOrders,
  markPartnerOrderReady,
  markPartnerOrderReceived,
  rejectPartnerOrder,
  reportOrderIssueByPartner,
  startPartnerOrderWashing,
} from "../partner-order.service";

// Mock DAL layer
vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseOrderDetailRestricted: vi.fn(async (houseId: string, orderId: string) => {
      // Mock db records
      if (houseId === "house-alpha" && orderId === "ord-created-valid") {
        return {
          id: "ord-created-valid",
          code: "ORD-20261015-alpha01",
          trackingToken: "trk_alpha_01",
          customerRawName: "Jean Munanira",
          customerFirstName: "Jean",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "created",
          source: "app",
          totalDue: 18000,
          itemsTotal: 15000,
          adjustedItemsTotal: null,
          commissionAmount: 3000,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: new Date(Date.now() + 24 * 3600 * 1000),
          acceptanceDeadlineAt: new Date(Date.now() + 30 * 60 * 1000), // in 30 mins
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      if (houseId === "house-alpha" && orderId === "ord-created-expired") {
        return {
          id: "ord-created-expired",
          code: "ORD-20261015-alpha02",
          trackingToken: "trk_alpha_02",
          customerRawName: "Amani Safari",
          customerFirstName: "Amani",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "created",
          source: "app",
          totalDue: 12000,
          itemsTotal: 10000,
          adjustedItemsTotal: null,
          commissionAmount: 2000,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago (EXPIRED)
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      if (houseId === "house-alpha" && orderId === "ord-picked-up") {
        return {
          id: "ord-picked-up",
          code: "ORD-20261015-alpha03",
          trackingToken: "trk_alpha_03",
          customerRawName: "Clarisse Baraka",
          customerFirstName: "Clarisse",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "picked_up",
          source: "app",
          totalDue: 25000,
          itemsTotal: 20000,
          adjustedItemsTotal: null,
          commissionAmount: 4000,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: null,
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      if (houseId === "house-alpha" && orderId === "ord-received") {
        return {
          id: "ord-received",
          code: "ORD-20261015-alpha05",
          trackingToken: "trk_alpha_05",
          customerRawName: "Clarisse Baraka",
          customerFirstName: "Clarisse",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "received",
          source: "app",
          totalDue: 25000,
          itemsTotal: 20000,
          adjustedItemsTotal: null,
          commissionAmount: 4000,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: null,
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      if (houseId === "house-alpha" && orderId === "ord-washing") {
        return {
          id: "ord-washing",
          code: "ORD-20261015-alpha04",
          trackingToken: "trk_alpha_04",
          customerRawName: "David Mugisho",
          customerFirstName: "David",
          neighborhoodId: "neigh-1",
          neighborhoodName: "Ibanda",
          status: "washing",
          source: "app",
          totalDue: 18000,
          itemsTotal: 15000,
          adjustedItemsTotal: null,
          commissionAmount: 3000,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: null,
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      // Reassigned order ORD-bkloj0q belongs exclusively to house-beta
      if (houseId === "house-beta" && orderId === "ord-reassigned-bkloj0q") {
        return {
          id: "ord-reassigned-bkloj0q",
          code: "ORD-20261015-bkloj0q",
          trackingToken: "trk_bkloj0q",
          customerRawName: "Esperance Nabintu",
          customerFirstName: "Esperance",
          neighborhoodId: "neigh-2",
          neighborhoodName: "Kadutu",
          status: "created",
          source: "app",
          totalDue: 22000,
          itemsTotal: 18000,
          adjustedItemsTotal: null,
          commissionAmount: 3600,
          commissionBps: 2000,
          currency: "CDF",
          pickupSlotStart: new Date(),
          pickupSlotEnd: new Date(),
          deliverySlotStart: null,
          deliverySlotEnd: null,
          estimatedDeliveryAt: null,
          acceptanceDeadlineAt: new Date(Date.now() + 45 * 60 * 1000),
          receptionDeadlineAt: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: null,
        };
      }

      // Any attempt by house-alpha to view ord-reassigned-bkloj0q returns null
      return null;
    }),

    getOrderItems: vi.fn(async () => [
      {
        id: "item-1",
        declaredQuantity: 2,
        receivedQuantity: null,
        unitPrice: 5000,
        itemNameFr: "Chemise",
        serviceNameFr: "Lavage & Repassage",
      },
    ]),

    getOrderEvents: vi.fn(async () => []),

    transitionOrderStatusAtomic: vi.fn(async () => true),

    getPartnerOrdersRestricted: vi.fn(async (houseId: string) => {
      if (houseId === "house-alpha") {
        return [
          {
            id: "ord-created-valid",
            code: "ORD-20261015-alpha01",
            shortReference: "#ALPHA01",
            status: "created",
            customerFirstName: "Jean",
            customerDisplayName: "Jean M.",
            customerPhone: null, // Hidden before acceptance!
            neighborhoodName: "Ibanda",
            itemsCount: 2,
            itemsSummary: "2 Chemise",
            services: ["Lavage & Repassage"],
            pickupSlotStart: new Date(),
            pickupSlotEnd: new Date(),
            deliverySlotStart: null,
            deliverySlotEnd: null,
            estimatedDeliveryAt: null,
            acceptanceDeadlineAt: new Date(Date.now() + 30 * 60 * 1000),
            isAtRisk: false,
            totalDue: 18000,
            itemsTotal: 15000,
            commissionAmount: 3000,
            commissionBps: 2000,
            netPartnerShare: 12000, // 15000 - 3000
            currency: "CDF",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "ord-accepted-example",
            code: "ORD-20261015-alpha05",
            shortReference: "#ALPHA05",
            status: "accepted",
            customerFirstName: "Baraka",
            customerDisplayName: "Baraka Cikuru",
            customerPhone: "+243 99 123 4567", // Shown after acceptance!
            neighborhoodName: "Ibanda",
            itemsCount: 3,
            itemsSummary: "3 Chemise",
            services: ["Nettoyage à sec"],
            pickupSlotStart: new Date(),
            pickupSlotEnd: new Date(),
            deliverySlotStart: null,
            deliverySlotEnd: null,
            estimatedDeliveryAt: null,
            acceptanceDeadlineAt: null,
            isAtRisk: false,
            totalDue: 21000,
            itemsTotal: 18000,
            commissionAmount: 3600,
            commissionBps: 2000,
            netPartnerShare: 14400,
            currency: "CDF",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      }
      return [];
    }),

    getPartnerOrderTabCountsRestricted: vi.fn(async (houseId: string) => {
      if (houseId === "house-alpha") {
        return {
          to_accept: 1,
          to_collect: 1,
          in_treatment: 0,
          ready: 0,
          delivered: 0,
          failed: 0,
          total: 2,
        };
      }
      return {
        to_accept: 0,
        to_collect: 0,
        in_treatment: 0,
        ready: 0,
        delivered: 0,
        failed: 0,
        total: 0,
      };
    }),

    recordPartnerOrderHandover: vi.fn(async (params: { houseId: string; orderId: string }) => {
      return params.houseId === "house-alpha";
    }),

    reportPartnerOrderIssue: vi.fn(async (params: { houseId: string; orderId: string }) => {
      return params.houseId === "house-alpha";
    }),
  };
});

describe("Partner Orders Domain Service", () => {
  describe("1. Tenant Isolation & Reassignment Guarantee", () => {
    it("prevents House Alpha from accessing or modifying an order belonging to House Beta", async () => {
      // Reassigned order ORD-bkloj0q belongs to house-beta
      const res = await getPartnerOrderDetail("house-alpha", "ord-reassigned-bkloj0q");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Commande introuvable");
      }
    });

    it("prevents House Alpha from accepting an order assigned to House Beta", async () => {
      const res = await acceptPartnerOrder({
        houseId: "house-alpha",
        orderId: "ord-reassigned-bkloj0q",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Commande introuvable ou déjà réassignée");
      }
    });

    it("allows House Beta to access its legitimately reassigned order", async () => {
      const res = await getPartnerOrderDetail("house-beta", "ord-reassigned-bkloj0q");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.order.code).toBe("ORD-20261015-bkloj0q");
      }
    });
  });

  describe("2. Customer Privacy & DTO Field Exclusion", () => {
    it("hides customer phone number and shows pseudonym before acceptance", async () => {
      const ordersRes = await listPartnerOrders("house-alpha");
      expect(ordersRes.ok).toBe(true);
      if (ordersRes.ok) {
        const createdOrder = ordersRes.value.find((o) => o.status === "created");
        expect(createdOrder).toBeDefined();
        expect(createdOrder?.customerPhone).toBeNull();
        expect(createdOrder?.customerDisplayName).toBe("Jean M.");
      }
    });

    it("reveals customer phone and full name only after order is accepted", async () => {
      const ordersRes = await listPartnerOrders("house-alpha");
      expect(ordersRes.ok).toBe(true);
      if (ordersRes.ok) {
        const acceptedOrder = ordersRes.value.find((o) => o.status === "accepted");
        expect(acceptedOrder).toBeDefined();
        expect(acceptedOrder?.customerPhone).toBe("+243 99 123 4567");
        expect(acceptedOrder?.customerDisplayName).toBe("Baraka Cikuru");
      }
    });

    it("computes net partner share correctly (items total minus commission)", async () => {
      const ordersRes = await listPartnerOrders("house-alpha");
      expect(ordersRes.ok).toBe(true);
      if (ordersRes.ok) {
        const order = ordersRes.value[0];
        expect(order.netPartnerShare).toBe(12000); // 15000 items - 3000 commission
      }
    });
  });

  describe("3. Expiry Lockout & Allowed Status Transitions", () => {
    it("strictly blocks acceptance if the 45-minute acceptance deadline has passed", async () => {
      const res = await acceptPartnerOrder({
        houseId: "house-alpha",
        orderId: "ord-created-expired",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Le délai d'acceptation de 45 minutes est dépassé");
      }
    });

    it("allows acceptance when within the 45-minute deadline", async () => {
      const res = await acceptPartnerOrder({
        houseId: "house-alpha",
        orderId: "ord-created-valid",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(true);
    });

    it("requires a non-empty reason when rejecting an incoming order", async () => {
      const res = await rejectPartnerOrder({
        houseId: "house-alpha",
        orderId: "ord-created-valid",
        actorId: "user-alpha",
        actorRole: "house",
        reason: "  ",
      });
      expect(res.ok).toBe(false);
    });

    it("allows advancing picked_up to received (T11)", async () => {
      const res = await markPartnerOrderReceived({
        houseId: "house-alpha",
        orderId: "ord-picked-up",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(true);
    });

    it("allows advancing received to washing (T13)", async () => {
      const res = await startPartnerOrderWashing({
        houseId: "house-alpha",
        orderId: "ord-received",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(true);
    });

    it("allows advancing washing to ready (T16)", async () => {
      const res = await markPartnerOrderReady({
        houseId: "house-alpha",
        orderId: "ord-washing",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(true);
    });

    it("successfully records courier handover", async () => {
      const res = await handoverPartnerOrderToCourier({
        houseId: "house-alpha",
        orderId: "ord-washing",
        actorId: "user-alpha",
        actorRole: "house",
      });
      expect(res.ok).toBe(true);
    });

    it("successfully reports an issue with mandatory reason", async () => {
      const res = await reportOrderIssueByPartner({
        houseId: "house-alpha",
        orderId: "ord-washing",
        actorId: "user-alpha",
        actorRole: "house",
        reason: "Tache indélébile pré-existante constatée",
      });
      expect(res.ok).toBe(true);
    });
  });
});
