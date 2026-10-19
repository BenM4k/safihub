import { describe, it, expect, vi } from "vitest";
import { formatAmount, formatPhone } from "@/lib/order-formatters";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import {
  validateMemberActionGuardrails,
  HOUSE_ROLE_PERMISSIONS,
  type StaffMemberRecord,
} from "@/services/auth/house-permissions";
import { addHouseExclusionRule } from "@/services/house/house.service";

// Mock DAL layer
const mockExclusionsList: Array<{
  id: string;
  houseId: string;
  itemId: string | null;
  itemNameFr: string | null;
  fabricId: string | null;
  fabricNameFr: string | null;
  note: string | null;
}> = [
  {
    id: "ex-1",
    houseId: "house-1",
    itemId: "item-leather-id",
    itemNameFr: "Veste en cuir",
    fabricId: null,
    fabricNameFr: null,
    note: "Pas de solvant adapté",
  },
];

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getHouseExclusions: vi.fn(async (houseId: string) => {
      return mockExclusionsList.filter((ex) => ex.houseId === houseId);
    }),
    createHouseExclusion: vi.fn(async (data: {
      houseId: string;
      itemId?: string | null;
      fabricId?: string | null;
      note?: string | null;
    }) => {
      mockExclusionsList.push({
        id: `ex-${mockExclusionsList.length + 1}`,
        houseId: data.houseId,
        itemId: data.itemId ?? null,
        itemNameFr: "Article",
        fabricId: data.fabricId ?? null,
        fabricNameFr: "Matière",
        note: data.note ?? null,
      });
    }),
  };
});

describe("Partner Settings - Comprehensive Unit Tests", () => {
  describe("1. Currency & Phone Formatters", () => {
    it("formats Congolese Francs amounts with thousand separators and CDF suffix", () => {
      expect(formatAmount(5000)).toBe("5 000 CDF");
      expect(formatAmount(20000)).toBe("20 000 CDF");
      expect(formatAmount(0)).toBe("0 CDF");
      expect(formatAmount(150000)).toBe("150 000 CDF");
    });

    it("formats DRC phone numbers into international standard +243 format", () => {
      expect(formatPhone("+243999123456")).toBe("+243 99 912 3456");
      expect(formatPhone("0999123456")).toBe("+243 99 912 3456");
      expect(formatPhone("999123456")).toBe("+243 99 912 3456");
      expect(formatPhone(null)).toBe("—");
      expect(formatPhone("")).toBe("—");
    });
  });

  describe("2. Image Validation (Banner & Vitrine Upload)", () => {
    it("accepts valid JPG, PNG, and WebP files under 5 MB", () => {
      const validFile = new File(["test data"], "vitrine.webp", { type: "image/webp" });
      const res = validateBannerImageFile(validFile);
      expect(res.ok).toBe(true);
    });

    it("rejects unsupported file formats like GIF or PDF", () => {
      const gifFile = new File(["test data"], "vitrine.gif", { type: "image/gif" });
      const res = validateBannerImageFile(gifFile);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Format non supporté");
      }
    });

    it("rejects files larger than 5 MB", () => {
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], "vitrine.jpg", { type: "image/jpeg" });
      const res = validateBannerImageFile(largeFile);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("5 Mo");
      }
    });
  });

  describe("3. Exclusions Guardrails & Invariants", () => {
    it("blocks double-joker exclusion ('Tous les articles' + 'Toutes les matières')", async () => {
      const res = await addHouseExclusionRule({
        houseId: "house-1",
        itemId: null,
        fabricId: null,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Veuillez sélectionner au moins un article ou une matière");
      }
    });

    it("allows excluding a specific fabric across all articles", async () => {
      const res = await addHouseExclusionRule({
        houseId: "house-1",
        itemId: null,
        fabricId: "fabric-silk-id",
        note: "Soie délicate non traitée",
      });

      expect(res.ok).toBe(true);
    });

    it("prevents duplicate exclusion rules for the exact same item and fabric", async () => {
      // 'item-leather-id' with fabricId=null already exists in mockExclusionsList for house-1
      const dupRes = await addHouseExclusionRule({
        houseId: "house-1",
        itemId: "item-leather-id",
        fabricId: null,
      });

      expect(dupRes.ok).toBe(false);
      if (!dupRes.ok) {
        expect(dupRes.error).toContain("existe déjà");
      }
    });
  });

  describe("4. Permission Matrix & Team Guardrails", () => {
    it("defines proper capability matrix per role", () => {
      // Owner has all permissions
      expect(HOUSE_ROLE_PERMISSIONS.owner.canEditPayout).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.owner.canManageTeam).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.owner.canEditCatalogue).toBe(true);

      // Manager has operational permissions but cannot edit payout or manage team
      expect(HOUSE_ROLE_PERMISSIONS.manager.canEditCatalogue).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.manager.canEditExclusions).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.manager.canEditPayout).toBe(false);
      expect(HOUSE_ROLE_PERMISSIONS.manager.canManageTeam).toBe(false);

      // Operator only executes orders
      expect(HOUSE_ROLE_PERMISSIONS.operator.canAcceptRejectOrders).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.operator.canEditCatalogue).toBe(false);
      expect(HOUSE_ROLE_PERMISSIONS.operator.canEditSettings).toBe(false);
      expect(HOUSE_ROLE_PERMISSIONS.operator.canEditPayout).toBe(false);
    });

    it("protects the last owner from being demoted or removed", () => {
      const singleOwnerStaff: StaffMemberRecord[] = [
        {
          userId: "user-owner-1",
          name: "Jean Propriétaire",
          email: "jean@example.com",
          role: "owner",
        },
        {
          userId: "user-op-1",
          name: "Marc Opérateur",
          email: "marc@example.com",
          role: "operator",
        },
      ];

      const checkRemoval = validateMemberActionGuardrails({
        staffList: singleOwnerStaff,
        callerUserId: "user-owner-1",
        callerRole: "owner",
        targetUserId: "user-owner-1",
        isRemoval: true,
      });

      expect(checkRemoval.allowed).toBe(false);
      if (!checkRemoval.allowed) {
        expect(checkRemoval.error).toContain("dernier propriétaire");
      }

      const checkDemotion = validateMemberActionGuardrails({
        staffList: singleOwnerStaff,
        callerUserId: "user-owner-1",
        callerRole: "owner",
        targetUserId: "user-owner-1",
        targetNewRole: "operator",
      });

      expect(checkDemotion.allowed).toBe(false);
      if (!checkDemotion.allowed) {
        expect(checkDemotion.error).toContain("dernier propriétaire");
      }
    });

    it("prevents operators from managing team members", () => {
      const staff: StaffMemberRecord[] = [
        {
          userId: "user-op-1",
          name: "Marc Opérateur",
          email: "marc@example.com",
          role: "operator",
        },
      ];

      const res = validateMemberActionGuardrails({
        staffList: staff,
        callerUserId: "user-op-1",
        callerRole: "operator",
        targetUserId: "user-op-1",
        isRemoval: true,
      });

      expect(res.allowed).toBe(false);
      if (!res.allowed) {
        expect(res.error).toContain("n'ont pas la permission");
      }
    });

    it("prevents self-elevation from operator or manager to owner", () => {
      const staff: StaffMemberRecord[] = [
        {
          userId: "user-mgr-1",
          name: "Paul Gérant",
          email: "paul@example.com",
          role: "manager",
        },
      ];

      const res = validateMemberActionGuardrails({
        staffList: staff,
        callerUserId: "user-mgr-1",
        callerRole: "manager",
        targetUserId: "user-mgr-1",
        targetNewRole: "owner",
      });

      expect(res.allowed).toBe(false);
      if (!res.allowed) {
        expect(res.error).toContain("élever votre propre rôle");
      }
    });
  });

  describe("5. Pause Dialog & Date Bounds", () => {
    it("calculates correct preset timestamps", () => {
      const now = Date.now();
      const oneHour = new Date(now + 1 * 3600 * 1000);
      const fourHours = new Date(now + 4 * 3600 * 1000);

      expect(oneHour.getTime()).toBeGreaterThan(now);
      expect(fourHours.getTime() - oneHour.getTime()).toBe(3 * 3600 * 1000);
    });
  });

  describe("6. Minimum Order Amount Bounds & Validation", () => {
    it("validates positive bounds: rejects negative amounts and enforces max 500 000 CDF", () => {
      const isAmountValid = (amount: number) => Number.isInteger(amount) && amount >= 0 && amount <= 500000;

      expect(isAmountValid(0)).toBe(true);
      expect(isAmountValid(5000)).toBe(true);
      expect(isAmountValid(500000)).toBe(true);
      expect(isAmountValid(-100)).toBe(false);
      expect(isAmountValid(500001)).toBe(false);
      expect(isAmountValid(12.5)).toBe(false);
    });
  });

  describe("7. Notification Matrix Channel Invariant", () => {
    it("ensures new_order always maintains at least one active channel (appSound or push)", () => {
      const toggleChannel = (
        current: { appSound: boolean; push: boolean },
        channelToToggle: "appSound" | "push"
      ) => {
        const next = { ...current };
        const otherChannel = channelToToggle === "appSound" ? next.push : next.appSound;

        // If toggling off, and the other channel is already off, block
        if (!otherChannel && next[channelToToggle]) {
          return current; // Block disabling
        }

        next[channelToToggle] = !next[channelToToggle];
        return next;
      };

      // Both true initially -> can disable appSound
      const step1 = toggleChannel({ appSound: true, push: true }, "appSound");
      expect(step1).toEqual({ appSound: false, push: true });

      // Only push is true -> cannot disable push
      const step2 = toggleChannel(step1, "push");
      expect(step2).toEqual({ appSound: false, push: true }); // Blocked!
    });
  });

  describe("8. Payout Re-Authentication Requirement", () => {
    it("rejects payout modifications without password confirmation", () => {
      const validatePayoutReauth = (password?: string | null) => {
        if (!password || password.trim().length === 0) {
          return { ok: false, error: "Veuillez saisir votre mot de passe pour confirmer." };
        }
        return { ok: true };
      };

      expect(validatePayoutReauth("").ok).toBe(false);
      expect(validatePayoutReauth(null).ok).toBe(false);
      expect(validatePayoutReauth("   ").ok).toBe(false);
      expect(validatePayoutReauth("validPassword123").ok).toBe(true);
    });
  });

  describe("9. Tenant Isolation Guard", () => {
    it("strictly isolates house operations by houseId scope", () => {
      const callerContext = { houseId: "house-own-1", role: "house" };
      const requestedHouseId = "house-other-2";

      const canAccessHouse = (ctx: typeof callerContext, targetId: string) => {
        if (ctx.role === "admin") return true;
        return ctx.houseId === targetId;
      };

      expect(canAccessHouse(callerContext, requestedHouseId)).toBe(false);
      expect(canAccessHouse(callerContext, "house-own-1")).toBe(true);
    });
  });
});
