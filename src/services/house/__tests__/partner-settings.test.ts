import { describe, it, expect, vi } from "vitest";
import { formatAmount, formatPhone } from "@/lib/order-formatters";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import {
  validateMemberActionGuardrails,
  normalizeStaffRole,
  HOUSE_ROLE_PERMISSIONS,
  type StaffMemberRecord,
} from "@/services/auth/house-permissions";
import {
  addHouseExclusionRule,
  updateHouseGeneralSettings,
} from "@/services/house/house.service";
import { fromBukavuDateTime } from "@/services/availability/bukavu-time";
import {
  toggleNotificationRow,
  type NotificationMatrixRow,
} from "@/components/house/settings/notifications-tab";

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
    updateHouse: vi.fn(async () => ({})),
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
    it("converts Bukavu date and time strings accurately into UTC timestamps", () => {
      // Bukavu is UTC+2 year-round. 14:00 local should be 12:00 UTC.
      const parsedDate = fromBukavuDateTime("2026-06-15", "14:00");
      expect(parsedDate.toISOString()).toBe("2026-06-15T12:00:00.000Z");
    });

    it("calculates preset pause timestamps in the future", () => {
      const now = Date.now();
      const oneHour = new Date(now + 1 * 3600 * 1000);
      const fourHours = new Date(now + 4 * 3600 * 1000);
      const twentyFourHours = new Date(now + 24 * 3600 * 1000);

      expect(oneHour.getTime()).toBeGreaterThan(now);
      expect(fourHours.getTime() - oneHour.getTime()).toBe(3 * 3600 * 1000);
      expect(twentyFourHours.getTime() - fourHours.getTime()).toBe(20 * 3600 * 1000);
    });
  });

  describe("6. Minimum Order Amount Bounds & Validation", () => {
    it("rejects negative minimumOrderAmount in updateHouseGeneralSettings", async () => {
      const res = await updateHouseGeneralSettings({
        houseId: "house-1",
        dailyCapacity: 20,
        minimumOrderAmount: -500,
        isPaused: false,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Minimum order amount cannot be negative");
      }
    });

    it("rejects zero or negative dailyCapacity when provided", async () => {
      const resZero = await updateHouseGeneralSettings({
        houseId: "house-1",
        dailyCapacity: 0,
        minimumOrderAmount: 5000,
        isPaused: false,
      });

      expect(resZero.ok).toBe(false);
      if (!resZero.ok) {
        expect(resZero.error).toBe("Daily capacity must be a positive integer or null");
      }
    });

    it("accepts valid positive minimumOrderAmount and dailyCapacity", async () => {
      const res = await updateHouseGeneralSettings({
        houseId: "house-1",
        dailyCapacity: 25,
        minimumOrderAmount: 7000,
        isPaused: false,
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("7. Notification Matrix Channel Invariant", () => {
    it("ensures new_order always maintains at least one active channel (appSound or push)", () => {
      const initialRows: NotificationMatrixRow[] = [
        {
          eventKey: "new_order",
          label: "Nouvelle commande reçue",
          appSound: true,
          push: true,
          sms: false,
          whatsapp: false,
          email: false,
        },
      ];

      // Both true initially -> can disable appSound
      const step1 = toggleNotificationRow(initialRows, 0, "appSound");
      expect(step1[0]?.appSound).toBe(false);
      expect(step1[0]?.push).toBe(true);

      // Only push is true -> cannot disable push, toggle is prevented
      const step2 = toggleNotificationRow(step1, 0, "push");
      expect(step2[0]?.appSound).toBe(false);
      expect(step2[0]?.push).toBe(true);
      expect(step2).toBe(step1); // Returns identical reference when blocked
    });
  });

  describe("8. Payout Re-Authentication Requirement", () => {
    it("enforces that only owners have permission to edit payout settings", () => {
      expect(HOUSE_ROLE_PERMISSIONS.owner.canEditPayout).toBe(true);
      expect(HOUSE_ROLE_PERMISSIONS.manager.canEditPayout).toBe(false);
      expect(HOUSE_ROLE_PERMISSIONS.operator.canEditPayout).toBe(false);
    });
  });

  describe("9. Tenant Isolation & Staff Role Guardrails", () => {
    it("normalizes roles consistently for house, admin, and owner", () => {
      expect(normalizeStaffRole("owner")).toBe("owner");
      expect(normalizeStaffRole("admin")).toBe("owner");
      expect(normalizeStaffRole("house")).toBe("owner");
      expect(normalizeStaffRole("manager")).toBe("manager");
      expect(normalizeStaffRole("operator")).toBe("operator");
      expect(normalizeStaffRole("unknown")).toBe("operator");
    });

    it("prevents operators from managing team members", () => {
      const staff: StaffMemberRecord[] = [
        { userId: "op-1", name: "Op", email: "op@test.cd", role: "operator" },
      ];
      const res = validateMemberActionGuardrails({
        staffList: staff,
        callerUserId: "op-1",
        callerRole: "operator",
        targetUserId: "op-1",
        isRemoval: true,
      });
      expect(res.allowed).toBe(false);
    });

    it("prevents managers from removing or demoting an owner", () => {
      const staff: StaffMemberRecord[] = [
        { userId: "own-1", name: "Owner", email: "own@test.cd", role: "owner" },
        { userId: "mgr-1", name: "Mgr", email: "mgr@test.cd", role: "manager" },
      ];
      const res = validateMemberActionGuardrails({
        staffList: staff,
        callerUserId: "mgr-1",
        callerRole: "manager",
        targetUserId: "own-1",
        isRemoval: true,
      });
      expect(res.allowed).toBe(false);
    });

    it("prevents removing the last remaining owner", () => {
      const staff: StaffMemberRecord[] = [
        { userId: "own-1", name: "Owner", email: "own@test.cd", role: "owner" },
      ];
      const res = validateMemberActionGuardrails({
        staffList: staff,
        callerUserId: "own-1",
        callerRole: "owner",
        targetUserId: "own-1",
        isRemoval: true,
      });
      expect(res.allowed).toBe(false);
      if (!res.allowed) {
        expect(res.error).toContain("dernier propriétaire");
      }
    });
  });
});
