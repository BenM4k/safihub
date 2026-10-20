import { describe, expect, it, vi } from "vitest";
import { requestCoverageExtension } from "../house.service";

// Mock DAL layer
vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseCoverageWithLimits: vi.fn(async (houseId: string) => {
      if (houseId === "house-1") {
        return {
          houseId: "house-1",
          houseName: "Pressing Ruzizi",
          effectiveMaxDistanceLevel: 2,
          items: [],
        };
      }
      return null;
    }),
    recordCoverageExtensionTicket: vi.fn(async (params) => {
      return { ok: true, value: { ticketReference: params.ticketReference } };
    }),
  };
});

describe("In-App Coverage Extension Support Ticket Service", () => {
  it("rejects ticket request without valid session or IDs", async () => {
    const res = await requestCoverageExtension({
      houseId: "",
      userId: "",
      targetDistanceLevel: 3,
      reasonCategory: "Demande client",
      note: "Nous avons plusieurs clients à Bagira.",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Session de pressing non authentifiée");
    }
  });

  it("rejects ticket request with insufficient note description (< 5 chars)", async () => {
    const res = await requestCoverageExtension({
      houseId: "house-1",
      userId: "user-1",
      targetDistanceLevel: 3,
      reasonCategory: "Demande client",
      note: "abc",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("au moins 5 caractères");
    }
  });

  it("rejects invalid target distance level (> 3)", async () => {
    const res = await requestCoverageExtension({
      houseId: "house-1",
      userId: "user-1",
      targetDistanceLevel: 4,
      reasonCategory: "Demande client",
      note: "Extension vers niveau 4",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Niveau de distance cible invalide");
    }
  });

  it("rejects request if target level is equal to or less than current level", async () => {
    const res = await requestCoverageExtension({
      houseId: "house-1",
      userId: "user-1",
      targetDistanceLevel: 2, // House is already at level 2
      reasonCategory: "Demande client",
      note: "Demande pour niveau 2 déjà couvert",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("dessert déjà jusqu'au niveau 2");
    }
  });

  it("rejects request if house does not exist", async () => {
    const res = await requestCoverageExtension({
      houseId: "house-unknown",
      userId: "user-1",
      targetDistanceLevel: 3,
      reasonCategory: "Demande client",
      note: "Pressing inexistant dans la base",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Pressing introuvable");
    }
  });

  it("successfully creates internal support ticket and returns valid ticket reference", async () => {
    const res = await requestCoverageExtension({
      houseId: "house-1",
      userId: "user-1",
      targetDistanceLevel: 3,
      reasonCategory: "Demande client",
      note: "Nos livreurs peuvent desservir les quartiers excentrés de Bagira.",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.ticketReference).toMatch(/^TIC-EXT-[A-Z0-9]+-[A-Z0-9]+$/);
    }
  });
});
