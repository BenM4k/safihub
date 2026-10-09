import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getCourierAssignedMissionsService,
  getCourierMissionDetailService,
  acceptMissionService,
  startPickupMissionService,
  completePickupMissionService,
  failPickupMissionService,
  startDeliveryMissionService,
  completeDeliveryMissionService,
  failDeliveryMissionService,
  getCourierCashService,
  getCourierHistoryService,
  syncOfflineCourierActionsService,
} from "../courier.service";
import type {
  CourierAssignedMissionSummary,
  CourierMissionDetail,
  CourierCashOverview,
  CourierHistoryData,
} from "@/dal";

const mockMissions: CourierAssignedMissionSummary[] = [
  {
    id: "m_pickup_1",
    orderId: "ord_1",
    orderCode: "SAF-1001",
    type: "pickup",
    status: "assigned",
    slotStart: new Date("2026-10-09T08:00:00Z"),
    slotEnd: new Date("2026-10-09T10:00:00Z"),
    customerNeighborhood: "Ibanda",
    customerLandmark: "Près de l'Hôtel Panorama",
    customerFirstName: "Amani",
    customerPhone: "+243999111222",
    houseName: "Pressing Kivu Pro",
    houseNeighborhood: "Kadutu",
    housePhone: "+243888333444",
    courierPay: 2500,
    cashCollected: null,
    totalDue: 15000,
  },
  {
    id: "m_delivery_1",
    orderId: "ord_2",
    orderCode: "SAF-1002",
    type: "delivery",
    status: "assigned",
    slotStart: new Date("2026-10-09T14:00:00Z"),
    slotEnd: new Date("2026-10-09T16:00:00Z"),
    customerNeighborhood: "Kadutu",
    customerLandmark: "Marché Central",
    customerFirstName: "Bahati",
    customerPhone: "+243999555666",
    houseName: "Pressing Kivu Pro",
    houseNeighborhood: "Kadutu",
    housePhone: "+243888333444",
    courierPay: 2500,
    cashCollected: null,
    totalDue: 22000,
  },
];

const mockPickupDetail: CourierMissionDetail = {
  mission: mockMissions[0]!,
  orderStatus: "pickup_assigned",
  deliveryConfirmationCode: null,
  paymentCurrency: "CDF",
  exchangeRateUsed: null,
  items: [
    {
      id: "oi_1",
      itemId: "itm_chemise",
      itemName: "Chemise",
      fabricName: "Coton",
      serviceName: "Nettoyage & Repassage",
      customLabel: null,
      declaredQuantity: 2,
      pickupQuantity: 2,
      receivedQuantity: null,
      unitPrice: 3500,
      conditionNote: null,
      isFlagged: false,
      status: "accepted",
    },
    {
      id: "oi_2",
      itemId: "itm_veste",
      itemName: "Veste Costume",
      fabricName: "Laine",
      serviceName: "Nettoyage à sec",
      customLabel: null,
      declaredQuantity: 1,
      pickupQuantity: 1,
      receivedQuantity: null,
      unitPrice: 8000,
      conditionNote: "Tache légère revers droit",
      isFlagged: true,
      status: "accepted",
    },
  ],
  photos: [
    {
      id: "photo_1",
      storageKey: "photos/veste_revers.webp",
      type: "pickup_condition",
      orderItemId: "oi_2",
      createdAt: new Date(),
    },
  ],
  failedPickupCount: 0,
  failedDeliveryCount: 0,
};

const mockDeliveryDetail: CourierMissionDetail = {
  mission: mockMissions[1]!,
  orderStatus: "delivery_assigned",
  deliveryConfirmationCode: "4829",
  paymentCurrency: "CDF",
  exchangeRateUsed: null,
  items: [],
  photos: [],
  failedPickupCount: 0,
  failedDeliveryCount: 0,
};

let unremittedCashAmount = 25000;
let cashCeilingAmount: number | null = 50000;

vi.mock("@/dal", () => ({
  getCourierAssignedMissions: vi.fn(async (courierId: string) => {
    if (courierId === "courier_1") return mockMissions;
    return [];
  }),
  getCourierMissionDetail: vi.fn(async (courierId: string, missionId: string) => {
    if (courierId !== "courier_1") return null;
    if (missionId === "m_pickup_1") return mockPickupDetail;
    if (missionId === "m_delivery_1") return mockDeliveryDetail;
    return null;
  }),
  acceptMissionAtomic: vi.fn(async (missionId: string, courierId: string) => {
    return courierId === "courier_1" && (missionId === "m_pickup_1" || missionId === "m_delivery_1");
  }),
  startPickupMissionAtomic: vi.fn(async (missionId: string, courierId: string) => {
    if (courierId === "courier_1" && missionId === "m_pickup_1") {
      return { ok: true };
    }
    return { ok: false, error: "Mission introuvable" };
  }),
  completePickupMissionAtomic: vi.fn(async (params) => {
    // AC 9 check
    const flaggedWithoutPhoto = params.items.find(
      (it: { isFlagged?: boolean; orderItemId?: string }) =>
        it.isFlagged && it.orderItemId === "oi_missing_photo"
    );
    if (flaggedWithoutPhoto) {
      return {
        ok: false,
        error: "Au moins une photo est requise pour chaque article signalé précieux ou endommagé (AC 9)",
      };
    }

    const hasCountDiscrepancy = params.items.some(
      (it: { pickupQuantity?: number; orderItemId?: string }) =>
        it.pickupQuantity !== 2 && it.orderItemId === "oi_1"
    );

    return { ok: true, hasCountDiscrepancy };
  }),
  failPickupMissionAtomic: vi.fn(async (params) => {
    if (!params.reason) return { ok: false, error: "Reason required" };
    return { ok: true };
  }),
  startDeliveryMissionAtomic: vi.fn(async () => {
    // AC 13 check
    if (cashCeilingAmount !== null && unremittedCashAmount >= cashCeilingAmount) {
      return {
        ok: false,
        error: `Plafond de trésorerie dépassé (${unremittedCashAmount} / ${cashCeilingAmount} CDF). Versement requis (AC 13).`,
      };
    }
    return { ok: true };
  }),
  completeDeliveryMissionAtomic: vi.fn(async (params) => {
    if (params.confirmationCode !== "4829") {
      return {
        ok: false,
        error: "Code de confirmation de livraison invalide. Demandez le code au client.",
      };
    }
    const discrepancyFlagged = params.cashCollected !== 22000;
    return { ok: true, discrepancyFlagged };
  }),
  failDeliveryMissionAtomic: vi.fn(async (params) => {
    if (!params.reason) return { ok: false, error: "Reason required" };
    return { ok: true };
  }),
  getCourierCashOverview: vi.fn(async (courierId: string): Promise<CourierCashOverview> => ({
    courierId,
    cashHeld: unremittedCashAmount,
    cashCollected: 45000,
    cashRemitted: 20000,
    cashCeiling: cashCeilingAmount,
    securityDeposit: 15000,
    changeFloat: 10000,
    isCeilingExceeded: cashCeilingAmount !== null && unremittedCashAmount >= cashCeilingAmount,
    owedToHouses: 18000,
    owedToOwner: 7000,
    recentLedgerEntries: [
      {
        id: "led_1",
        entryType: "cash_collected",
        amount: 22000,
        currency: "CDF",
        orderId: "ord_2",
        note: "Paiement à la livraison",
        createdAt: new Date(),
      },
    ],
  })),
  getCourierHistory: vi.fn(async (): Promise<CourierHistoryData> => ({
    missions: [
      {
        id: "m_hist_1",
        orderId: "ord_old_1",
        orderCode: "SAF-999",
        type: "pickup",
        status: "completed",
        slotStart: new Date("2026-10-08T08:00:00Z"),
        completedAt: new Date("2026-10-08T09:15:00Z"),
        courierPay: 2500,
        customerNeighborhood: "Ibanda",
        failureReason: null,
      },
      {
        id: "m_hist_2",
        orderId: "ord_old_2",
        orderCode: "SAF-998",
        type: "delivery",
        status: "failed",
        slotStart: new Date("2026-10-07T14:00:00Z"),
        completedAt: new Date("2026-10-07T15:00:00Z"),
        courierPay: 0,
        customerNeighborhood: "Kadutu",
        failureReason: "Client absent au rendez-vous",
      },
    ],
    totalEarningsCDF: 2500,
    completedCount: 1,
    failedCount: 1,
  })),
}));

describe("Phase 6: Courier Interface Engine & Lifecycle", () => {
  beforeEach(() => {
    unremittedCashAmount = 25000;
    cashCeilingAmount = 50000;
  });

  describe("Task 6.1: Courier shell and missions (Restricted Projection)", () => {
    it("returns assigned missions for the authenticated courier only", async () => {
      const res = await getCourierAssignedMissionsService("courier_1");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.length).toBe(2);
        // Restricted projection: customer name is first name only
        expect(res.value[0]?.customerFirstName).toBe("Amani");
        // Customer phone and landmark are included for its own assigned missions
        expect(res.value[0]?.customerPhone).toBe("+243999111222");
        expect(res.value[0]?.customerLandmark).toContain("Panorama");
      }

      // Other courier sees no missions
      const otherRes = await getCourierAssignedMissionsService("courier_other");
      expect(otherRes.ok).toBe(true);
      if (otherRes.ok) {
        expect(otherRes.value.length).toBe(0);
      }
    });

    it("allows a courier to accept an assigned mission", async () => {
      const res = await acceptMissionService("courier_1", "m_pickup_1");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.missionId).toBe("m_pickup_1");
      }
    });

    it("rejects unauthorized access to mission details for another courier", async () => {
      const res = await getCourierMissionDetailService("courier_intruder", "m_pickup_1");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("unauthorized");
      }
    });
  });

  describe("Task 6.2: Pickup flow (AC 8, AC 9, Failure counter)", () => {
    it("starts pickup mission transitioning status to in_progress", async () => {
      const res = await startPickupMissionService("courier_1", "m_pickup_1");
      expect(res.ok).toBe(true);
    });

    it("AC 8: detects count discrepancy when actual count differs from declared order", async () => {
      const res = await completePickupMissionService({
        courierId: "courier_1",
        missionId: "m_pickup_1",
        items: [
          {
            orderItemId: "oi_1",
            pickupQuantity: 3, // Declared was 2 -> Discrepancy!
          },
        ],
        onSiteApproved: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.hasCountDiscrepancy).toBe(true);
      }
    });

    it("AC 9: blocks completion if flagged valuable/damaged item has no condition photo", async () => {
      const res = await completePickupMissionService({
        courierId: "courier_1",
        missionId: "m_pickup_1",
        items: [
          {
            orderItemId: "oi_missing_photo",
            pickupQuantity: 1,
            isFlagged: true,
          },
        ],
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Au moins une photo est requise");
      }
    });

    it("records failed pickup with mandatory reason", async () => {
      // Missing reason: rejects
      const noReasonRes = await failPickupMissionService({
        courierId: "courier_1",
        missionId: "m_pickup_1",
        reason: "",
      });
      expect(noReasonRes.ok).toBe(false);

      // With reason: succeeds
      const successRes = await failPickupMissionService({
        courierId: "courier_1",
        missionId: "m_pickup_1",
        reason: "Client absent après 3 appels téléphoniques",
      });
      expect(successRes.ok).toBe(true);
    });
  });

  describe("Task 6.3: Delivery flow (AC 12, AC 13, Confirmation Code)", () => {
    it("AC 13: blocks starting delivery mission when courier held cash exceeds cash ceiling", async () => {
      // Exceed ceiling
      unremittedCashAmount = 60000;
      cashCeilingAmount = 50000;

      const res = await startDeliveryMissionService("courier_1", "m_delivery_1");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Plafond de trésorerie dépassé");
      }
    });

    it("allows starting delivery mission when courier held cash is within ceiling", async () => {
      unremittedCashAmount = 25000;
      cashCeilingAmount = 50000;

      const res = await startDeliveryMissionService("courier_1", "m_delivery_1");
      expect(res.ok).toBe(true);
    });

    it("verifies delivery confirmation code and rejects mismatched code", async () => {
      const wrongCodeRes = await completeDeliveryMissionService({
        courierId: "courier_1",
        missionId: "m_delivery_1",
        confirmationCode: "0000", // Expected is 4829
        cashCollected: 22000,
      });

      expect(wrongCodeRes.ok).toBe(false);
      if (!wrongCodeRes.ok) {
        expect(wrongCodeRes.error).toContain("Code de confirmation de livraison invalide");
      }
    });

    it("AC 12: completes delivery and flags discrepancy if collected cash differs from total due", async () => {
      // Total due is 22,000 CDF. Courier collected 20,000 CDF -> Discrepancy!
      const res = await completeDeliveryMissionService({
        courierId: "courier_1",
        missionId: "m_delivery_1",
        confirmationCode: "4829",
        cashCollected: 20000,
        cashCurrency: "CDF",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.discrepancyFlagged).toBe(true);
      }
    });

    it("records delivery failure with reason", async () => {
      const res = await failDeliveryMissionService({
        courierId: "courier_1",
        missionId: "m_delivery_1",
        reason: "Client absent au lieu de livraison",
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("Task 6.4: Cash controls & history (Amount owed to each party)", () => {
    it("returns cash held, ceiling, and breakdown owed to house vs owner", async () => {
      const res = await getCourierCashService("courier_1");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.cashHeld).toBe(25000);
        expect(res.value.cashCeiling).toBe(50000);
        expect(res.value.securityDeposit).toBe(15000);
        expect(res.value.changeFloat).toBe(10000);
        // Owed to each party breakdown
        expect(res.value.owedToHouses).toBe(18000);
        expect(res.value.owedToOwner).toBe(7000);
        expect(res.value.recentLedgerEntries.length).toBeGreaterThan(0);
      }
    });

    it("returns courier mission history and earnings", async () => {
      const res = await getCourierHistoryService("courier_1");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.missions.length).toBe(2);
        expect(res.value.completedCount).toBe(1);
        expect(res.value.failedCount).toBe(1);
        expect(res.value.totalEarningsCDF).toBe(2500);
      }
    });
  });

  describe("Task 6.5 & 6.6: Offline queue synchronization & conflict handling (AC 14)", () => {
    it("AC 14: synchronizes valid queued actions in chronological order", async () => {
      const queuedActions = [
        {
          id: "act_1",
          type: "accept_mission" as const,
          missionId: "m_pickup_1",
          payload: {},
          timestamp: 1000,
        },
        {
          id: "act_2",
          type: "start_pickup" as const,
          missionId: "m_pickup_1",
          payload: {},
          timestamp: 2000,
        },
      ];

      const res = await syncOfflineCourierActionsService({
        courierId: "courier_1",
        actions: queuedActions,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.successCount).toBe(2);
        expect(res.value.rejectedCount).toBe(0);
        expect(res.value.results[0]?.status).toBe("applied");
        expect(res.value.results[1]?.status).toBe("applied");
      }
    });

    it("AC 14: avoids duplicate events when replaying already-applied actions", async () => {
      // Simulate that mission is already in completed state
      const duplicateAction = {
        id: "act_dup",
        type: "complete_pickup" as const,
        missionId: "m_pickup_1",
        payload: { items: [] },
        timestamp: 3000,
      };

      // Set mock detail to completed
      mockPickupDetail.mission.status = "completed";

      const res = await syncOfflineCourierActionsService({
        courierId: "courier_1",
        actions: [duplicateAction],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.results[0]?.status).toBe("duplicate");
        expect(res.value.rejectedCount).toBe(0);
      }

      // Reset mock status
      mockPickupDetail.mission.status = "assigned";
    });

    it("AC 14: rejects invalid queued actions on sync with clear resolution message", async () => {
      const invalidAction = {
        id: "act_invalid",
        type: "fail_pickup" as const,
        missionId: "m_pickup_1",
        payload: { reason: "" }, // Missing reason triggers rejection!
        timestamp: 4000,
      };

      const res = await syncOfflineCourierActionsService({
        courierId: "courier_1",
        actions: [invalidAction],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.rejectedCount).toBe(1);
        expect(res.value.results[0]?.status).toBe("rejected");
        expect(res.value.results[0]?.message).toContain("reason is required");
      }
    });
  });
});
