import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  getCustomerOrders: vi.fn(),
  blockUserAndRevokeSessions: vi.fn(),
  updateUserRoleAndStatus: vi.fn(),
  setUserPasswordCredential: vi.fn(),
  deleteUserSessions: vi.fn(),
  recordDailyCourierReconciliation: vi.fn(),
  approveItemRequestTransaction: vi.fn(),
  getUserByContactPhone: vi.fn(),
  getOrderById: vi.fn(),
  insertOrderWithDetails: vi.fn(),
  getHouses: vi.fn(),
  getNeighborhoods: vi.fn(),
  getZoneFees: vi.fn(),
  getMasterServices: vi.fn(),
  getMasterItems: vi.fn(),
  getMasterFabrics: vi.fn(),
  getSettings: vi.fn(),
  getLatestExchangeRate: vi.fn(),
  getOrderValidationData: vi.fn(),
}));

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getUserById: (...args: unknown[]) => mocks.getUserById(...args),
    getCustomerOrders: (...args: unknown[]) => mocks.getCustomerOrders(...args),
    blockUserAndRevokeSessions: (...args: unknown[]) =>
      mocks.blockUserAndRevokeSessions(...args),
    updateUserRoleAndStatus: (...args: unknown[]) =>
      mocks.updateUserRoleAndStatus(...args),
    setUserPasswordCredential: (...args: unknown[]) =>
      mocks.setUserPasswordCredential(...args),
    deleteUserSessions: (...args: unknown[]) => mocks.deleteUserSessions(...args),
    recordDailyCourierReconciliation: (...args: unknown[]) =>
      mocks.recordDailyCourierReconciliation(...args),
    approveItemRequestTransaction: (...args: unknown[]) =>
      mocks.approveItemRequestTransaction(...args),
    getUserByContactPhone: (...args: unknown[]) =>
      mocks.getUserByContactPhone(...args),
    getOrderById: (...args: unknown[]) => mocks.getOrderById(...args),
    insertOrderWithDetails: (...args: unknown[]) =>
      mocks.insertOrderWithDetails(...args),
    getHouses: (...args: unknown[]) => mocks.getHouses(...args),
    getNeighborhoods: (...args: unknown[]) => mocks.getNeighborhoods(...args),
    getZoneFees: (...args: unknown[]) => mocks.getZoneFees(...args),
    getMasterServices: (...args: unknown[]) => mocks.getMasterServices(...args),
    getMasterItems: (...args: unknown[]) => mocks.getMasterItems(...args),
    getMasterFabrics: (...args: unknown[]) => mocks.getMasterFabrics(...args),
    getSettings: (...args: unknown[]) => mocks.getSettings(...args),
    getLatestExchangeRate: (...args: unknown[]) =>
      mocks.getLatestExchangeRate(...args),
    getOrderValidationData: (...args: unknown[]) =>
      mocks.getOrderValidationData(...args),
  };
});

import { fromBukavuDateTime } from "@/services/availability";
import { escapeLikePattern } from "@/dal/db";
import {
  appendCdfMetadataTag,
  extractStoredCdfAmount,
  resolveCappedLedgerMovement,
  resolveLedgerCdfAmount,
} from "@/lib/ledger-fx";
import { sanitizeServiceError } from "@/lib/service-errors";
import { confirmAdminDailyReconciliation } from "../cash.service";
import { approveAdminItemRequest } from "../catalog.service";
import { blockAdminCustomer, unblockAdminCustomer } from "../customer.service";
import { createManualAdminOrder } from "../order.service";
import { resetAdminUserPassword } from "../user.service";
import {
  executeAdminWhatsAppTest,
  getWhatsAppIntegrationStatus,
  simulateAdminWhatsAppBotStep,
} from "@/services/whatsapp";

describe("Phase 1 Security & Backend Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sanitizeServiceError & escapeLikePattern", () => {
    it("maps PostgreSQL error codes and hides raw SQL details", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(
        sanitizeServiceError(
          { code: "23505", message: "duplicate key value violates unique constraint users_email_key" },
          "Fallback",
          "test"
        )
      ).toBe("Un enregistrement identique existe déjà.");

      expect(
        sanitizeServiceError(
          { cause: { code: "23503" }, message: "violates foreign key" },
          "Fallback",
          "test"
        )
      ).toBe("Référence invalide ou introuvable.");

      expect(
        sanitizeServiceError(
          new Error('SELECT * FROM "users" WHERE password = $1'),
          "Opération impossible",
          "test"
        )
      ).toBe("Opération impossible");

      consoleSpy.mockRestore();
    });

    it("escapes LIKE wildcard characters", () => {
      expect(escapeLikePattern("100%_admin\\test")).toBe("100\\%\\_admin\\\\test");
    });
  });

  describe("Customer role scope & last-admin bypass prevention", () => {
    it("rejects blocking a non-customer (e.g. admin) via blockAdminCustomer", async () => {
      mocks.getUserById.mockResolvedValue({
        id: "usr_admin_1",
        role: "admin",
        status: "active",
        banned: false,
      });

      const res = await blockAdminCustomer({
        customerId: "usr_admin_1",
        reason: "Attempted bypass",
        operatorName: "Operator",
      });

      expect(res.ok).toBe(false);
      expect(mocks.blockUserAndRevokeSessions).not.toHaveBeenCalled();
    });

    it("rejects unblocking a non-customer via unblockAdminCustomer", async () => {
      mocks.getUserById.mockResolvedValue({
        id: "usr_admin_1",
        role: "admin",
        status: "blocked",
        banned: true,
      });

      const res = await unblockAdminCustomer("usr_admin_1");

      expect(res.ok).toBe(false);
      expect(mocks.updateUserRoleAndStatus).not.toHaveBeenCalled();
    });
  });

  describe("resetAdminUserPassword checks", () => {
    it("rejects resetting another admin's password", async () => {
      mocks.getUserById.mockResolvedValue({
        id: "usr_admin_2",
        role: "admin",
        status: "active",
        banned: false,
      });

      const res = await resetAdminUserPassword({
        userId: "usr_admin_2",
        newPassword: "StrongPassword#123",
        operatorId: "usr_admin_1",
      });

      expect(res.ok).toBe(false);
      expect(mocks.setUserPasswordCredential).not.toHaveBeenCalled();
    });

    it("rejects non-customer target when requireCustomerRole is set", async () => {
      mocks.getUserById.mockResolvedValue({
        id: "usr_house_1",
        role: "house",
        status: "active",
        banned: false,
      });

      const res = await resetAdminUserPassword({
        userId: "usr_house_1",
        newPassword: "StrongPassword#123",
        operatorId: "usr_admin_1",
        requireCustomerRole: true,
      });

      expect(res.ok).toBe(false);
      expect(mocks.setUserPasswordCredential).not.toHaveBeenCalled();
    });

    it("sanitizes raw failure from setUserPasswordCredential without deleting sessions", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.getUserById.mockResolvedValue({
        id: "usr_cust_1",
        role: "customer",
        status: "active",
        banned: false,
      });
      mocks.setUserPasswordCredential.mockResolvedValue({
        ok: false,
        error: 'SELECT * FROM "account" WHERE secret = 123',
      });

      const res = await resetAdminUserPassword({
        userId: "usr_cust_1",
        newPassword: "StrongPassword#123",
        operatorId: "usr_admin_1",
        requireCustomerRole: true,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Échec de la mise à jour du mot de passe.");
      }
      expect(mocks.setUserPasswordCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "usr_cust_1",
          operatorId: "usr_admin_1",
          requireCustomerRole: true,
        })
      );
      expect(mocks.deleteUserSessions).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("confirmAdminDailyReconciliation error propagation", () => {
    it("returns err instead of ok when recordDailyCourierReconciliation returns ok: false", async () => {
      mocks.recordDailyCourierReconciliation.mockResolvedValue({
        ok: false,
        error: "Cette journée a déjà été réconciliée pour ce coursier",
        discrepancyLogged: false,
        depositDeducted: false,
      });

      const res = await confirmAdminDailyReconciliation({
        courierId: "usr_courier_1",
        businessDate: "2026-11-25",
        expectedAmount: 25000,
        receivedAmount: 25000,
        reconciledBy: "usr_admin_1",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("déjà été réconciliée");
      }
    });
  });

  describe("WhatsApp Admin Test & Bot Simulator Dry-Run safety", () => {
    it("masks short identifiers (<= 6 chars) completely", () => {
      const prevPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      process.env.WHATSAPP_PHONE_NUMBER_ID = "12345";
      try {
        const status = getWhatsAppIntegrationStatus();
        expect(status.phoneNumberIdMasked).toBe("••••");
      } finally {
        if (prevPhoneId === undefined) delete process.env.WHATSAPP_PHONE_NUMBER_ID;
        else process.env.WHATSAPP_PHONE_NUMBER_ID = prevPhoneId;
      }
    });

    it("does not invoke fetch in dryRun mode for test sender", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      const res = await executeAdminWhatsAppTest({
        scenario: "order_status",
        recipientPhone: "+243991234567",
        locale: "fr",
        dryRun: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.dryRun).toBe(true);
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does not mutate live bot session in dryRun mode", async () => {
      const fetchSpy = vi.spyOn(global, "fetch");

      const res = await simulateAdminWhatsAppBotStep({
        phone: "+243991234567",
        actionType: "button",
        value: "START_ORDER",
        dryRun: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.step).toBe("IDLE");
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("USD↔CDF ledger metadata & capped currency semantics", () => {
    it("persists and extracts posting-time CDF values without revaluing historical entries", () => {
      const taggedNote = appendCdfMetadataTag("Caution retenue : 10 USD", 28000, 2800);
      expect(extractStoredCdfAmount(taggedNote)).toBe(28000);
      // Even when active rate rises to 3200, stored historical CDF value is preserved
      expect(resolveLedgerCdfAmount(10, "USD", taggedNote, 3200)).toBe(28000);
      // CDF entries always return raw amount
      expect(resolveLedgerCdfAmount(15000, "CDF", taggedNote, 3200)).toBe(15000);
    });

    it("records full 2800 CDF release as 1 USD and partial remainders in CDF without rounding up", () => {
      expect(
        resolveCappedLedgerMovement({
          requestedAmount: 2,
          currency: "USD",
          availableCdf: 2800,
          rate: 2800,
        })
      ).toEqual({
        cdfDelta: 2800,
        ledgerAmount: 1,
        ledgerCurrency: "USD",
      });

      expect(
        resolveCappedLedgerMovement({
          requestedAmount: 1,
          currency: "USD",
          availableCdf: 1000,
          rate: 2800,
        })
      ).toEqual({
        cdfDelta: 1000,
        ledgerAmount: 1000,
        ledgerCurrency: "CDF",
      });
    });
  });

  describe("approveAdminItemRequest kind guard & createManualAdminOrder idempotency", () => {
    it("rejects approval when request kind mismatches submitted kind", async () => {
      mocks.approveItemRequestTransaction.mockResolvedValueOnce({
        kindMismatch: true,
      });

      const res = await approveAdminItemRequest({
        requestId: "req_1",
        adminId: "usr_admin_1",
        kind: "fabric",
        nameFr: "Chemise",
        nameSw: "Shati",
      });

      expect(res.ok).toBe(false);
    });

    it("returns existing order on duplicate idempotencyKey without inserting again", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(fromBukavuDateTime("2026-10-12", "06:00"));
      try {
        mocks.getUserByContactPhone.mockResolvedValue({
          id: "usr_cust_1",
          role: "customer",
          status: "active",
          banned: false,
        });
        mocks.getHouses.mockResolvedValue([
          {
            id: "house_1",
            name: "Pressing Test",
            neighborhoodId: "neigh_1",
            isActive: true,
            isPaused: false,
            minimumOrderAmount: 1000,
            commissionBps: 2000,
            cutoffMinutes: 0,
            dailyCapacity: 20,
            reviewStatus: "approved",
          },
        ]);
        mocks.getNeighborhoods.mockResolvedValue([
          { id: "neigh_1", name: "Ibanda", zoneId: "zone_1", status: "served" },
        ]);
        mocks.getZoneFees.mockResolvedValue([
          { customerZoneId: "zone_1", houseZoneId: "zone_1", deliveryFee: 2000, distanceLevel: 1 },
        ]);
        mocks.getMasterServices.mockResolvedValue([{ id: "srv_1", isActive: true }]);
        mocks.getMasterItems.mockResolvedValue([{ id: "itm_1", isActive: true }]);
        mocks.getMasterFabrics.mockResolvedValue([{ id: "fab_1", isActive: true }]);
        mocks.getSettings.mockResolvedValue({
          maxItemsPerOrder: 50,
          defaultCommissionBps: 2000,
          maxCoverageDistanceLevel: 2,
          acceptanceDelayMinutes: 45,
          firstOrderScreening: false,
          maxOpenOrdersPerCustomer: 5,
          failedPickupBlockThreshold: 3,
        });
        mocks.getLatestExchangeRate.mockResolvedValue(null);
        mocks.getOrderValidationData.mockResolvedValue({
          existingOrders: [
            {
              id: "ord_existing_1",
              customerId: "usr_cust_1",
              code: "SF-999111",
              trackingToken: "tok-existing-1",
              idempotencyKey: "manual-dup-key",
              status: "created",
            },
          ],
          houseItems: [
            {
              id: "hi_1",
              houseId: "house_1",
              serviceId: "srv_1",
              itemId: "itm_1",
              fabricId: "fab_1",
              price: 3000,
              isActive: true,
            },
          ],
          houseHours: [{ houseId: "house_1", weekday: 1, opensAt: "08:00", closesAt: "18:00" }],
          houseClosures: [],
          houseCoverage: [{ houseId: "house_1", neighborhoodId: "neigh_1", isActive: true, pausedUntil: null }],
          courierShifts: [{ courierId: "cour_1", weekday: 1, startsAt: "07:30", endsAt: "18:30" }],
          courierZones: [{ courierId: "cour_1", zoneId: "zone_1" }],
          customerFailedPickupCount: 0,
          customerCompletedOrdersCount: 1,
          customerOpenOrdersCount: 0,
          dailyOrdersForPhoneCount: 0,
          isCustomerBlocked: false,
        });

        const slotStart = fromBukavuDateTime("2026-10-12", "14:00");
        const slotEnd = fromBukavuDateTime("2026-10-12", "16:00");
        const res = await createManualAdminOrder({
          idempotencyKey: "manual-dup-key",
          customerPhone: "+243990001122",
          houseId: "house_1",
          customerNeighborhoodId: "neigh_1",
          landmark: "La Botte",
          pickupSlotStart: slotStart,
          pickupSlotEnd: slotEnd,
          items: [
            {
              serviceId: "srv_1",
              itemId: "itm_1",
              fabricId: "fab_1",
              quantity: 1,
            },
          ],
          source: "phone",
          adminId: "usr_admin_1",
        });

        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value).toEqual({
            orderId: "ord_existing_1",
            code: "SF-999111",
            trackingToken: "tok-existing-1",
          });
        }
        expect(mocks.insertOrderWithDetails).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
