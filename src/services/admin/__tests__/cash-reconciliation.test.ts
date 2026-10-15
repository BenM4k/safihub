import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  confirmAdminDailyReconciliation,
  getAdminDailyReconciliation,
  reverseAdminCourierReconciliation,
} from "../cash.service";

interface MockReconRecord {
  id: string;
  courierId: string;
  businessDate: string;
  currency: "CDF" | "USD";
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  status: "open" | "confirmed";
  note: string | null;
  reconciledBy: string | null;
  createdAt: Date;
}

let mockReconciliations: MockReconRecord[] = [];
let mockDepositBalance = 30000;
let mockLedgerReversals: Array<{ entryId: string; reason: string; reversedBy: string }> = [];

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getDailyCourierReconciliationData: vi.fn(async (dateStr: string) => {
      const recon = mockReconciliations.find((r) => r.businessDate === dateStr);
      return {
        couriers: [
          {
            courierId: "courier-42",
            name: "Jean-Pierre Baraka",
            phone: "+243991234567",
            expectedCashCDF: 25000,
            expectedCashUSD: 0,
            heldCashCDF: 25000,
            securityDeposit: mockDepositBalance,
            changeFloat: 10000,
            reconciliationId: recon?.id ?? null,
            status: recon?.status ?? "open",
            receivedAmount: recon?.receivedAmount ?? 0,
            difference: recon ? recon.difference : -25000,
            currency: "CDF" as const,
            note: recon?.note ?? null,
            orders: [
              {
                id: "ord-1",
                code: "ORD-1042",
                amount: 15000,
                currency: "CDF" as const,
                customerPhone: "+243812345678",
                createdAt: new Date(),
              },
              {
                id: "ord-2",
                code: "ORD-1043",
                amount: 10000,
                currency: "CDF" as const,
                customerPhone: "+243851112233",
                createdAt: new Date(),
              },
            ],
          },
        ],
        summary: {
          totalExpectedCDF: 25000,
          totalReceivedCDF: recon?.receivedAmount ?? 0,
          totalDiscrepancyCDF: recon?.difference ?? -25000,
        },
      };
    }),

    recordDailyCourierReconciliation: vi.fn(async (params) => {
      const diff = params.receivedAmount - params.expectedAmount;
      const discrepancyLogged = diff !== 0;
      let depositDeducted = false;

      if (params.deductFromDeposit && diff < 0) {
        const deduction = Math.min(Math.abs(diff), mockDepositBalance);
        mockDepositBalance -= deduction;
        depositDeducted = true;
      }

      const existingIndex = mockReconciliations.findIndex(
        (r) => r.courierId === params.courierId && r.businessDate === params.businessDate
      );

      const record: MockReconRecord = {
        id: existingIndex >= 0 ? mockReconciliations[existingIndex].id : `recon-${Date.now()}`,
        courierId: params.courierId,
        businessDate: params.businessDate,
        currency: params.currency ?? "CDF",
        expectedAmount: params.expectedAmount,
        receivedAmount: params.receivedAmount,
        difference: diff,
        status: "confirmed",
        note: params.note ?? null,
        reconciledBy: params.reconciledBy,
        createdAt: new Date(),
      };

      if (existingIndex >= 0) {
        mockReconciliations[existingIndex] = record;
      } else {
        mockReconciliations.push(record);
      }

      return {
        ok: true,
        reconciliationId: record.id,
        discrepancyLogged,
        depositDeducted,
      };
    }),

    reverseCourierReconciliation: vi.fn(async ({ reconciliationId, reason, reversedBy }) => {
      const recon = mockReconciliations.find((r) => r.id === reconciliationId);
      if (!recon) {
        return { ok: false, error: "Réconciliation introuvable" };
      }

      if (recon.note?.includes("[ANNULÉE")) {
        return { ok: false, error: "Cette réconciliation a déjà été annulée" };
      }

      mockLedgerReversals.push({ entryId: reconciliationId, reason, reversedBy });

      recon.status = "open";
      recon.receivedAmount = 0;
      recon.difference = -recon.expectedAmount;
      recon.note = `[ANNULÉE par Admin : ${reason}] ${recon.note || ""}`.trim();

      return { ok: true, reversalId: `rev-${Date.now()}` };
    }),
  };
});

describe("Cash Controls & Daily Reconciliation Service", () => {
  beforeEach(() => {
    mockReconciliations = [];
    mockDepositBalance = 30000;
    mockLedgerReversals = [];
  });

  describe("Daily Reconciliation Data Fetching", () => {
    it("returns active couriers with expected cash, orders breakdown, and status", async () => {
      const res = await getAdminDailyReconciliation("2026-10-14");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.couriers).toHaveLength(1);
        const courier = res.value.couriers[0];
        expect(courier.expectedCashCDF).toBe(25000);
        expect(courier.status).toBe("open");
        expect(courier.orders).toHaveLength(2);
        expect(courier.orders?.[0].code).toBe("ORD-1042");
      }
    });

    it("rejects invalid date strings with French error message", async () => {
      const res = await getAdminDailyReconciliation("invalid-date");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Format de date invalide");
      }
    });
  });

  describe("Reconciliation State Transitions & Discrepancy Calculations", () => {
    it("confirms exact match reconciliation (Zero discrepancy)", async () => {
      const res = await confirmAdminDailyReconciliation({
        courierId: "courier-42",
        businessDate: "2026-10-14",
        expectedAmount: 25000,
        receivedAmount: 25000,
        reconciledBy: "admin-usr-1",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.discrepancyLogged).toBe(false);
        expect(res.value.depositDeducted).toBe(false);
      }

      expect(mockReconciliations[0].status).toBe("confirmed");
      expect(mockReconciliations[0].difference).toBe(0);
    });

    it("logs a shortage discrepancy and optionally deducts from deposit", async () => {
      // Expected 25 000 CDF, Received 20 000 CDF -> Shortage of 5 000 CDF
      const res = await confirmAdminDailyReconciliation({
        courierId: "courier-42",
        businessDate: "2026-10-14",
        expectedAmount: 25000,
        receivedAmount: 20000,
        note: "Billet de 5000 CDF manquant dans la sacoche",
        reconciledBy: "admin-usr-1",
        deductFromDeposit: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.discrepancyLogged).toBe(true);
        expect(res.value.depositDeducted).toBe(true);
      }

      // 30,000 - 5,000 = 25,000 CDF deposit remaining
      expect(mockDepositBalance).toBe(25000);
      expect(mockReconciliations[0].difference).toBe(-5000);
    });

    it("logs a surplus discrepancy without deducting from deposit", async () => {
      // Expected 25 000 CDF, Received 28 000 CDF -> Surplus of +3 000 CDF
      const res = await confirmAdminDailyReconciliation({
        courierId: "courier-42",
        businessDate: "2026-10-14",
        expectedAmount: 25000,
        receivedAmount: 28000,
        note: "Pourboire client conservé dans la sacoche",
        reconciledBy: "admin-usr-1",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.discrepancyLogged).toBe(true);
        expect(res.value.depositDeducted).toBe(false);
      }

      expect(mockReconciliations[0].difference).toBe(3000);
    });
  });

  describe("Reversal Flow ('Annuler l'écriture')", () => {
    it("successfully reverses a confirmed reconciliation with reason and logs audit note", async () => {
      // 1. First confirm reconciliation
      const confirmRes = await confirmAdminDailyReconciliation({
        courierId: "courier-42",
        businessDate: "2026-10-14",
        expectedAmount: 25000,
        receivedAmount: 25000,
        reconciledBy: "admin-usr-1",
      });
      expect(confirmRes.ok).toBe(true);
      const reconId = confirmRes.ok ? confirmRes.value.reconciliationId! : "";

      // 2. Reverse it
      const reverseRes = await reverseAdminCourierReconciliation({
        reconciliationId: reconId,
        reason: "Erreur de saisie : versement concernait un autre coursier",
        reversedBy: "admin-usr-1",
      });

      expect(reverseRes.ok).toBe(true);
      expect(mockLedgerReversals).toHaveLength(1);
      expect(mockLedgerReversals[0].reason).toContain("Erreur de saisie");

      // Verify the record stays visible with audit note and open status
      const updatedRecon = mockReconciliations.find((r) => r.id === reconId);
      expect(updatedRecon?.status).toBe("open");
      expect(updatedRecon?.note).toContain("[ANNULÉE par Admin");
    });

    it("rejects duplicate reversal attempt on already reversed entry", async () => {
      // 1. Confirm
      const confirmRes = await confirmAdminDailyReconciliation({
        courierId: "courier-42",
        businessDate: "2026-10-14",
        expectedAmount: 25000,
        receivedAmount: 25000,
        reconciledBy: "admin-usr-1",
      });
      const reconId = confirmRes.ok ? confirmRes.value.reconciliationId! : "";

      // 2. First reversal
      await reverseAdminCourierReconciliation({
        reconciliationId: reconId,
        reason: "Premier motif d'annulation",
        reversedBy: "admin-usr-1",
      });

      // 3. Second reversal attempt should fail
      const secondAttempt = await reverseAdminCourierReconciliation({
        reconciliationId: reconId,
        reason: "Tentative de deuxième annulation",
        reversedBy: "admin-usr-1",
      });

      expect(secondAttempt.ok).toBe(false);
      if (!secondAttempt.ok) {
        expect(secondAttempt.error).toContain("déjà été annulée");
      }
    });

    it("requires a non-empty reason for reversal", async () => {
      const res = await reverseAdminCourierReconciliation({
        reconciliationId: "recon-1",
        reason: "   ",
        reversedBy: "admin-usr-1",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("motif de contre-passation est obligatoire");
      }
    });
  });
});
