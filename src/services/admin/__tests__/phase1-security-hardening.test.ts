import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  getCustomerOrders: vi.fn(),
  blockUserAndRevokeSessions: vi.fn(),
  updateUserRoleAndStatus: vi.fn(),
  setUserPasswordCredential: vi.fn(),
  deleteUserSessions: vi.fn(),
  recordDailyCourierReconciliation: vi.fn(),
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
  };
});

import { escapeLikePattern } from "@/dal/db";
import { sanitizeServiceError } from "@/lib/service-errors";
import { confirmAdminDailyReconciliation } from "../cash.service";
import { blockAdminCustomer, unblockAdminCustomer } from "../customer.service";
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

    it("propagates failure if setUserPasswordCredential returns err", async () => {
      mocks.getUserById.mockResolvedValue({
        id: "usr_cust_1",
        role: "customer",
        status: "active",
        banned: false,
      });
      mocks.setUserPasswordCredential.mockResolvedValue({
        ok: false,
        error: "Credential update failed",
      });

      const res = await resetAdminUserPassword({
        userId: "usr_cust_1",
        newPassword: "StrongPassword#123",
        operatorId: "usr_admin_1",
        requireCustomerRole: true,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Credential update failed");
      }
      expect(mocks.deleteUserSessions).not.toHaveBeenCalled();
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
});
