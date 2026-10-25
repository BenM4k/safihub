import { describe, expect, it, vi } from "vitest";
import {
  getActiveAdminsCount,
  listAdminUsers,
} from "../user.service";
import { listAdminCustomers } from "../customer.service";

vi.mock("@/dal", () => {
  return {
    getAdminUsers: vi.fn(async (params?: { roles?: string[]; role?: string }) => {
      // Mock database records
      const allRecords = [
        { id: "u-admin", name: "Admin User", email: "admin@safi.cd", role: "admin", status: "active" },
        { id: "u-house", name: "House Manager", email: "house@safi.cd", role: "house", status: "active" },
        { id: "u-courier", name: "Courier Guy", email: "courier@safi.cd", role: "courier", status: "active" },
        { id: "u-customer", name: "Client A", email: "client@safi.cd", role: "customer", status: "active" },
      ];

      const allowedRoles = params?.roles ?? ["admin", "house"];
      return allRecords.filter((r) => allowedRoles.includes(r.role));
    }),
    countActiveAdmins: vi.fn(async () => 3),
    getAdminCustomers: vi.fn(async () => {
      return {
        customers: [
          {
            id: "u-customer-1",
            name: "Customer One",
            email: "c1@safi.cd",
            role: "customer",
            status: "active",
            isGuest: false,
            ordersCount: 5,
            totalSpentCDF: 50000,
            hasActiveOrders: false,
            lastOrderAt: new Date("2026-10-01"),
            firstOrderSource: "web",
            createdAt: new Date("2026-09-01"),
            updatedAt: new Date("2026-10-01"),
          },
        ],
        totalCount: 1,
      };
    }),
    getUserById: vi.fn(),
    getCustomerOrders: vi.fn(),
    getCustomerAddresses: vi.fn(),
    getMergedGuestAccounts: vi.fn(),
    getUserConsents: vi.fn(),
    blockUserAndRevokeSessions: vi.fn(),
    updateUserRoleAndStatus: vi.fn(),
    mergeGuestUser: vi.fn(),
  };
});

describe("Admin User & Customer Fetch Methods", () => {
  describe("listAdminUsers", () => {
    it("fetches only house and admin roles by default", async () => {
      const res = await listAdminUsers();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toHaveLength(2);
        const roles = res.value.map((u) => u.role);
        expect(roles).toContain("admin");
        expect(roles).toContain("house");
        expect(roles).not.toContain("courier");
        expect(roles).not.toContain("customer");
      }
    });

    it("passes custom role parameters when provided", async () => {
      const { getAdminUsers } = await import("@/dal");
      await listAdminUsers({ roles: ["admin", "house"], limit: 100 });
      expect(getAdminUsers).toHaveBeenCalledWith({
        roles: ["admin", "house"],
        limit: 100,
      });
    });

    it("returns error result when DAL throws", async () => {
      const { getAdminUsers } = await import("@/dal");
      vi.mocked(getAdminUsers).mockRejectedValueOnce(new Error("Database connection lost"));

      const res = await listAdminUsers();
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Database connection lost");
      }
    });
  });

  describe("getActiveAdminsCount", () => {
    it("returns active admin count wrapped in Result", async () => {
      const res = await getActiveAdminsCount();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBe(3);
      }
    });

    it("returns error when countActiveAdmins fails", async () => {
      const { countActiveAdmins } = await import("@/dal");
      vi.mocked(countActiveAdmins).mockRejectedValueOnce(new Error("Query failed"));

      const res = await getActiveAdminsCount();
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Query failed");
      }
    });
  });

  describe("listAdminCustomers", () => {
    it("strictly fetches only customer role records", async () => {
      const res = await listAdminCustomers({ limit: 50 });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.customers).toHaveLength(1);
        expect(res.value.customers[0].role).toBe("customer");
        expect(res.value.totalCount).toBe(1);
      }
    });

    it("returns error result when customer DAL query fails", async () => {
      const { getAdminCustomers } = await import("@/dal");
      vi.mocked(getAdminCustomers).mockRejectedValueOnce(new Error("DB timeout"));

      const res = await listAdminCustomers();
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("DB timeout");
      }
    });
  });
});
