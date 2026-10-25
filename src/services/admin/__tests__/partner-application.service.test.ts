import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  approvePartnerApplication,
  getAdminPartnerApplication,
  listAdminPartnerApplications,
  rejectPartnerApplication,
} from "../partner-application.service";
import { submitPartnerApplication } from "@/services/house/application.service";
import type { HouseApplicationRecord } from "@/dal/house-application.dal";
import { rateLimitPartnerApplication } from "@/services/abuse/rate-limiter";

const mockApplication: HouseApplicationRecord = {
  id: "app-123",
  houseName: "Pressing Étoile du Kivu",
  contactName: "Amani Mulemangabo",
  phone: "+243999000123",
  email: "amani@pressing.cd",
  neighborhoodId: "neigh-1",
  neighborhoodText: null,
  neighborhoodName: "Ibanda",
  addressNote: "Av. Patrice Lumumba n°12",
  servicesNote: "Eau courante + réservoir",
  hoursNote: "SNEL + Groupe électrogène",
  message: "Prêt pour le pilote",
  status: "pending",
  adminNote: null,
  reviewedBy: null,
  reviewedAt: null,
  createdHouseId: null,
  createdAt: new Date(),
};

vi.mock("@/dal/house-application.dal", () => ({
  createHouseApplication: vi.fn(async (params) => ({
    ...mockApplication,
    ...params,
    id: "app-new",
    createdAt: new Date(),
  })),
  getHouseApplicationById: vi.fn(async (id: string) => {
    if (id === "app-123") return mockApplication;
    if (id === "app-approved") return { ...mockApplication, id: "app-approved", status: "approved" };
    return null;
  }),
  getPendingApplicationByEmail: vi.fn(async () => null),
  listHouseApplications: vi.fn(async () => ({
    applications: [mockApplication],
    total: 1,
  })),
  updateHouseApplication: vi.fn(async () => ({
    ...mockApplication,
    status: "rejected",
  })),
  isHouseSlugAvailable: vi.fn(async () => true),
  approveHouseApplicationTransaction: vi.fn(async ({ house, user }) => ({
    houseId: "house-new-123",
    houseSlug: house.slug,
    userId: user.id,
    isNewAccount: true,
    passwordApplied: true,
  })),
}));

vi.mock("@/dal/coverage.dal", () => ({
  getNeighborhoods: vi.fn(async () => [{ id: "neigh-1", name: "Ibanda" }]),
}));

vi.mock("@/services/abuse/rate-limiter", () => ({
  rateLimitPartnerApplication: vi.fn(async () => ({ allowed: true, remaining: 5, resetSeconds: 60 })),
}));

vi.mock("@/services/email", () => ({
  sendPartnerInvitationEmail: vi.fn(async () => {}),
}));

describe("Partner Application Pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Public Application Submission (submitPartnerApplication)", () => {
    it("rejects application with empty or missing house name", async () => {
      const res = await submitPartnerApplication({
        houseName: " ",
        contactName: "Amani",
        phone: "+243999000123",
        email: "test@example.com",
        neighborhoodId: "neigh-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("HOUSE_NAME_REQUIRED");
      }
    });

    it("rejects application with invalid contact name", async () => {
      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: " ",
        phone: "+243999000123",
        email: "test@example.com",
        neighborhoodId: "neigh-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("CONTACT_NAME_REQUIRED");
      }
    });

    it("rejects application with invalid phone", async () => {
      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "123",
        email: "test@example.com",
        neighborhoodId: "neigh-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("PHONE_REQUIRED");
      }
    });

    it("rejects application with invalid email", async () => {
      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "invalid-email",
        neighborhoodId: "neigh-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("EMAIL_INVALID");
      }
    });

    it("rejects application if pending application already exists for email", async () => {
      const { getPendingApplicationByEmail } = await import("@/dal/house-application.dal");
      vi.mocked(getPendingApplicationByEmail).mockResolvedValueOnce(mockApplication);

      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "amani@pressing.cd",
        neighborhoodId: "neigh-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("APPLICATION_PENDING");
      }
    });

    it("rejects application if neither neighborhoodId nor neighborhoodText is provided", async () => {
      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "test@example.com",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("NEIGHBORHOOD_REQUIRED");
      }
    });

    it("successfully creates application with valid fields", async () => {
      const res = await submitPartnerApplication({
        houseName: "Pressing Étoile du Kivu",
        contactName: "Amani Mulemangabo",
        phone: "+243999000123",
        email: "amani@pressing.cd",
        neighborhoodId: "neigh-1",
        addressNote: "Av. Lumumba",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.houseName).toBe("Pressing Étoile du Kivu");
        expect(res.value.contactName).toBe("Amani Mulemangabo");
      }
    });

    it("enforces rate limiting on fallback IP bucket when clientIp is missing", async () => {
      vi.mocked(rateLimitPartnerApplication).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetSeconds: 60,
      });

      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "test@example.com",
        neighborhoodId: "neigh-1",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("RATE_LIMITED");
      }
      expect(rateLimitPartnerApplication).toHaveBeenCalledWith("ip:fallback");
    });

    it("enforces rate limiting with sanitized clientIp when provided", async () => {
      vi.mocked(rateLimitPartnerApplication).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetSeconds: 60,
      });

      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "test@example.com",
        neighborhoodId: "neigh-1",
        clientIp: " 197.157.210.5 ",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("RATE_LIMITED");
      }
      expect(rateLimitPartnerApplication).toHaveBeenCalledWith("ip:197.157.210.5");
    });

    it("enforces rate limiting on email", async () => {
      // First call (IP) allowed, second call (email) disallowed
      vi.mocked(rateLimitPartnerApplication)
        .mockResolvedValueOnce({ allowed: true, remaining: 5, resetSeconds: 60 })
        .mockResolvedValueOnce({ allowed: false, remaining: 0, resetSeconds: 60 });

      const res = await submitPartnerApplication({
        houseName: "Pressing Test",
        contactName: "Amani",
        phone: "+243999000123",
        email: "spammer@example.com",
        neighborhoodId: "neigh-1",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("RATE_LIMITED");
      }
      expect(rateLimitPartnerApplication).toHaveBeenCalledWith("email:spammer@example.com");
    });
  });

  describe("Admin Review Pipeline", () => {
    it("lists applications correctly", async () => {
      const res = await listAdminPartnerApplications();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.applications.length).toBe(1);
        expect(res.value.total).toBe(1);
      }
    });

    it("retrieves a single application by ID", async () => {
      const res = await getAdminPartnerApplication("app-123");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.id).toBe("app-123");
      }
    });

    it("returns error if application does not exist", async () => {
      const res = await getAdminPartnerApplication("non-existent");
      expect(res.ok).toBe(false);
    });

    it("rejects approval if application is not in pending status", async () => {
      const res = await approvePartnerApplication({
        applicationId: "app-approved",
        adminUserId: "admin-1",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("already approved");
      }
    });

    it("successfully approves pending application and creates house with slug and credentials", async () => {
      const res = await approvePartnerApplication({
        applicationId: "app-123",
        adminUserId: "admin-1",
        adminNote: "Audit technique validé",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.houseId).toBe("house-new-123");
        expect(res.value.houseSlug).toBe("pressing-etoile-du-kivu");
        expect(res.value.temporaryPassword).toBeDefined();
        expect(res.value.temporaryPassword.length).toBeGreaterThanOrEqual(8);
        expect(res.value.isNewAccount).toBe(true);
      }
    });

    it("accepts custom password if provided during approval", async () => {
      const res = await approvePartnerApplication({
        applicationId: "app-123",
        adminUserId: "admin-1",
        customPassword: "CustomPassword123!",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.temporaryPassword).toBe("CustomPassword123!");
      }
    });

    it("does not return temporary password when passwordApplied is false for existing account", async () => {
      const { approveHouseApplicationTransaction } = await import("@/dal/house-application.dal");
      vi.mocked(approveHouseApplicationTransaction).mockResolvedValueOnce({
        houseId: "house-existing-123",
        houseSlug: "pressing-etoile-du-kivu",
        userId: "user-existing-1",
        isNewAccount: false,
        passwordApplied: false,
      });

      const res = await approvePartnerApplication({
        applicationId: "app-123",
        adminUserId: "admin-1",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.temporaryPassword).toBe("");
        expect(res.value.passwordApplied).toBe(false);
        expect(res.value.isNewAccount).toBe(false);
      }
    });

    it("rejects rejection if note is missing", async () => {
      const res = await rejectPartnerApplication({
        applicationId: "app-123",
        adminUserId: "admin-1",
        adminNote: " ",
      });
      expect(res.ok).toBe(false);
    });

    it("successfully rejects application with note", async () => {
      const res = await rejectPartnerApplication({
        applicationId: "app-123",
        adminUserId: "admin-1",
        adminNote: "Capacité technique insuffisante pour le pilote",
      });
      expect(res.ok).toBe(true);
    });
  });
});
