import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  generatePhotoUploadUrlService,
  generatePhotoDownloadUrlService,
  getOrderPhotosWithSignedUrlsService,
  recordUploadedPhotoService,
  pruneExpiredPhotosService,
  canAccessOrderPhotos,
  PHOTO_LIMITS,
} from "../photo-storage.service";
import type { OrderAccessDetails, OrderPhotoRecord } from "@/dal";

const mockOrderAccess: OrderAccessDetails = {
  orderId: "ord_100",
  orderCode: "SAF-2001",
  customerId: "cust_1",
  houseId: "house_A",
  status: "accepted",
  guestToken: "guest_secret_tok_123",
  activeCourierIds: ["courier_1"],
  openDisputeCount: 0,
};

const mockPhotos: OrderPhotoRecord[] = [
  {
    id: "p_1",
    orderId: "ord_100",
    orderItemId: "oi_1",
    missionId: "m_1",
    disputeId: null,
    type: "pickup_condition",
    storageKey: "orders/ord_100/pickup_condition/photo1.webp",
    sizeBytes: 250000,
    takenBy: "courier_1",
    createdAt: new Date("2026-10-09T08:00:00Z"),
    deleteAfter: null,
    deletedAt: null,
  },
  {
    id: "p_2",
    orderId: "ord_100",
    orderItemId: null,
    missionId: "m_2",
    disputeId: null,
    type: "delivery_proof",
    storageKey: "orders/ord_100/delivery_proof/photo2.webp",
    sizeBytes: 280000,
    takenBy: "courier_1",
    createdAt: new Date("2026-10-09T14:00:00Z"),
    deleteAfter: new Date("2027-01-07T14:00:00Z"), // 90 days
    deletedAt: null,
  },
];

let orderPhotoCount = 2;
let itemPhotoCount = 1;
let openDisputes = 0;

vi.mock("@/dal", () => ({
  getOrderPhotos: vi.fn(async (orderId: string) => {
    if (orderId === "ord_100") return mockPhotos;
    return [];
  }),
  getOrderPhotoById: vi.fn(async (photoId: string) => {
    return mockPhotos.find((p) => p.id === photoId) || null;
  }),
  countPhotosForOrder: vi.fn(async () => orderPhotoCount),
  countPhotosForItem: vi.fn(async () => itemPhotoCount),
  insertOrderPhotoRecord: vi.fn(async () => "photo_new_123"),
  getOrderAccessDetails: vi.fn(async (orderId: string) => {
    if (orderId === "ord_100") {
      return { ...mockOrderAccess, openDisputeCount: openDisputes };
    }
    return null;
  }),
  getExpiredPhotosForPruning: vi.fn(async () => [
    { id: "p_old_1", storageKey: "orders/ord_100/old1.webp", orderId: "ord_100" },
    { id: "p_old_2", storageKey: "orders/ord_100/old2.webp", orderId: "ord_100" },
  ]),
  markPhotosDeletedAtomic: vi.fn(async (photoIds: string[]) => photoIds.length),
  checkUserHouseAccess: vi.fn(async (userId: string, houseId: string) => {
    // Only house_staff_A has access to house_A
    return userId === "staff_house_A" && houseId === "house_A";
  }),
}));

vi.mock("@/lib/storage/r2-client", () => ({
  getSignedUploadUrl: vi.fn(
    async (key: string) => `https://r2.safihub.cd/safihub/${key}?mock_put=1`
  ),
  getSignedDownloadUrl: vi.fn(
    async (key: string) => `https://r2.safihub.cd/safihub/${key}?mock_get=1`
  ),
  deleteStorageObject: vi.fn(async () => true),
  headStorageObject: vi.fn(async (key: string) => ({
    key,
    size: 240 * 1024,
    etag: "mock_etag",
  })),
  isStorageConfigured: vi.fn(() => true),
}));

describe("Phase 7: Cloudflare R2 Photos, Compression & Storage Architecture", () => {
  beforeEach(() => {
    orderPhotoCount = 2;
    itemPhotoCount = 1;
    openDisputes = 0;
  });

  describe("Task 7.1: Storage & Signed URLs (Permissions & Authorization)", () => {
    it("allows admin global access to order photos", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "admin_1", role: "admin" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(true);
    });

    it("allows customer to access photos of their own order", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "cust_1", role: "customer" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(true);
    });

    it("rejects other customers from accessing photos of an order", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "cust_other", role: "customer" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(false);
    });

    it("allows assigned courier to access order photos", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "courier_1", role: "courier" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(true);
    });

    it("rejects unassigned couriers from accessing order photos", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "courier_other", role: "courier" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(false);
    });

    it("allows laundry house staff to access photos of its own assigned orders", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "staff_house_A", role: "house" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(true);
    });

    it("AC 14 / Privacy Firewall: a house CANNOT see photos of other houses' orders", async () => {
      const allowed = await canAccessOrderPhotos({
        user: { id: "staff_house_B", role: "house" },
        orderAccess: mockOrderAccess,
      });
      expect(allowed).toBe(false);
    });

    it("allows guest tracking token access to order photos", async () => {
      const allowed = await canAccessOrderPhotos({
        user: null,
        orderAccess: mockOrderAccess,
        guestToken: "guest_secret_tok_123",
      });
      expect(allowed).toBe(true);
    });

    it("rejects invalid guest tracking token", async () => {
      const allowed = await canAccessOrderPhotos({
        user: null,
        orderAccess: mockOrderAccess,
        guestToken: "wrong_token",
      });
      expect(allowed).toBe(false);
    });

    it("generates short-lived presigned upload URL for authorized courier", async () => {
      const res = await generatePhotoUploadUrlService({
        user: { id: "courier_1", role: "courier" },
        orderId: "ord_100",
        orderItemId: "oi_1",
        type: "pickup_condition",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.uploadUrl).toContain("https://r2.safihub.cd");
        expect(res.value.storageKey).toContain("orders/ord_100/pickup_condition/");
        expect(res.value.expiresInSeconds).toBe(300);
      }
    });

    it("generates short-lived presigned download URL for authorized user", async () => {
      const res = await generatePhotoDownloadUrlService({
        user: { id: "cust_1", role: "customer" },
        photoId: "p_1",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.downloadUrl).toContain("https://r2.safihub.cd");
        expect(res.value.storageKey).toBe("orders/ord_100/pickup_condition/photo1.webp");
        expect(res.value.expiresInSeconds).toBe(900);
      }
    });
  });

  describe("Task 7.2: Limits & Quotas", () => {
    it("enforces order photo limit (max 20 per order)", async () => {
      orderPhotoCount = PHOTO_LIMITS.MAX_PER_ORDER; // 20

      const res = await generatePhotoUploadUrlService({
        user: { id: "courier_1", role: "courier" },
        orderId: "ord_100",
        type: "pickup_condition",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Limite maximale");
      }
    });

    it("enforces item photo limit (max 3 per item)", async () => {
      itemPhotoCount = PHOTO_LIMITS.MAX_PER_ITEM; // 3

      const res = await generatePhotoUploadUrlService({
        user: { id: "courier_1", role: "courier" },
        orderId: "ord_100",
        orderItemId: "oi_1",
        type: "pickup_condition",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("3 photos max");
      }
    });

    it("rejects photo exceeding maximum size limit (500 KB)", async () => {
      const r2 = await import("@/lib/storage/r2-client");
      vi.mocked(r2.headStorageObject).mockResolvedValueOnce({
        key: "orders/ord_100/pickup_condition/00000000-0000-0000-0000-000000000001.webp",
        size: 600 * 1024,
        etag: "etag_large",
      });

      const res = await recordUploadedPhotoService({
        user: { id: "courier_1", role: "courier" },
        orderId: "ord_100",
        type: "pickup_condition",
        storageKey: "orders/ord_100/pickup_condition/00000000-0000-0000-0000-000000000001.webp",
        sizeBytes: 600 * 1024, // 600 KB > 500 KB limit
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Taille de photo excessive");
      }
    });

    it("records valid photo successfully", async () => {
      const res = await recordUploadedPhotoService({
        user: { id: "courier_1", role: "courier" },
        orderId: "ord_100",
        type: "pickup_condition",
        storageKey: "orders/ord_100/pickup_condition/00000000-0000-0000-0000-000000000001.webp",
        sizeBytes: 240 * 1024, // 240 KB < 300 KB target
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.photoId).toBe("photo_new_123");
      }
    });
  });

  describe("Task 7.3: Photos in the Flows & Order Access", () => {
    it("returns photos with signed download URLs for authorized customer", async () => {
      const res = await getOrderPhotosWithSignedUrlsService({
        user: { id: "cust_1", role: "customer" },
        orderId: "ord_100",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.length).toBe(2);
        expect(res.value[0]?.downloadUrl).toContain("https://r2.safihub.cd");
        expect(res.value[1]?.downloadUrl).toContain("https://r2.safihub.cd");
      }
    });

    it("rejects unauthorized house from viewing order photos", async () => {
      const res = await getOrderPhotosWithSignedUrlsService({
        user: { id: "staff_house_B", role: "house" },
        orderId: "ord_100",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("non autorisé");
      }
    });
  });

  describe("Task 7.4: Retention Policy (90 Days) & Idempotency", () => {
    it("deletes expired photos and marks them deleted in database", async () => {
      openDisputes = 0; // No open disputes
      const res = await pruneExpiredPhotosService({
        now: new Date("2027-02-01T00:00:00Z"),
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.prunedCount).toBe(2);
        expect(res.value.skippedCount).toBe(0);
      }
    });

    it("preserves photos when an order has an open dispute even if expired", async () => {
      openDisputes = 1; // Open dispute protects photos
      const res = await pruneExpiredPhotosService({
        now: new Date("2027-02-01T00:00:00Z"),
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.prunedCount).toBe(0);
        expect(res.value.skippedCount).toBe(2);
      }
    });

    it("is idempotent: re-running on an empty candidate set succeeds without errors", async () => {
      const dal = await import("@/dal");
      vi.mocked(dal.getExpiredPhotosForPruning).mockResolvedValueOnce([]);

      const res = await pruneExpiredPhotosService({
        now: new Date("2020-01-01T00:00:00Z"),
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.prunedCount).toBe(0);
        expect(res.value.skippedCount).toBe(0);
      }
    });
  });
});
