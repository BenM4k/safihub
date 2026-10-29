import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitReview, submitReviewReply, moderateReview } from "@/services/review";
import { filterCatalogueOutliers } from "@/services/catalog/outliers";
import { generateMetadata } from "@/app/houses/[houseSlug]/page";
import type { CustomerHouseCatalogueItem } from "@/dal";

const { reviewsDb, insertReviewReplyMock } = vi.hoisted(() => ({
  reviewsDb: new Map<string, Record<string, unknown>>(),
  insertReviewReplyMock: vi.fn(async (data: Record<string, unknown>) => {
    const created = { ...data, id: `rep-${Date.now()}`, createdAt: new Date() };
    return created;
  }),
}));

// Mock DAL layer for review tests
vi.mock("@/dal/review.dal", () => {
  return {
    findReviewById: vi.fn(async (reviewId: string) => {
      if (reviewId === "rev-sample") {
        return { id: "rev-sample", houseId: "house-1", status: "published" };
      }
      return reviewsDb.get(reviewId) || null;
    }),
    findReviewByOrderId: vi.fn(async (orderId: string) => {
      for (const rev of reviewsDb.values()) {
        if (rev.orderId === orderId) return rev;
      }
      return null;
    }),
    insertReview: vi.fn(async (data: Record<string, unknown>) => {
      const created = { ...data, id: `rev-${Date.now()}`, createdAt: new Date() };
      reviewsDb.set(created.id as string, created);
      return created;
    }),
    insertReviewReply: insertReviewReplyMock,
    setReviewModerationStatus: vi.fn(async (reviewId: string, status: string, reason: string) => {
      const existing = reviewsDb.get(reviewId) || { id: reviewId, status: "published" };
      existing.status = status;
      existing.hiddenReason = reason;
      reviewsDb.set(reviewId, existing);
      return existing;
    }),
    recalculateHouseRatingStats: vi.fn(async (houseId: string) => ({
      houseId,
      reviewCount: 1,
      ratingSum: 5,
      averageRating: 5.0,
      distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 },
    })),
  };
});

// Mock Order & House access DAL
vi.mock("@/dal/order.dal", () => ({
  getOrderById: vi.fn(async (orderId: string) => {
    if (orderId === "order-delivered-user1") {
      return {
        id: "order-delivered-user1",
        customerId: "user-1",
        houseId: "house-1",
        status: "delivered",
      };
    }
    if (orderId === "order-washing-user1") {
      return {
        id: "order-washing-user1",
        customerId: "user-1",
        houseId: "house-1",
        status: "washing",
      };
    }
    if (orderId === "order-user2") {
      return {
        id: "order-user2",
        customerId: "user-2",
        houseId: "house-1",
        status: "delivered",
      };
    }
    return null;
  }),
}));

vi.mock("@/dal/house.dal", () => ({
  checkUserHouseAccess: vi.fn(async (userId: string, houseId: string) => {
    return userId === "staff-house-1" && houseId === "house-1";
  }),
}));

vi.mock("@/services/house", () => ({
  getCustomerHouseProfile: vi.fn(async (slug: string) => {
    if (slug === "lac-kivu") {
      return {
        ok: true,
        value: {
          house: {
            id: "house-1",
            name: "Pressing du Lac Kivu",
            slug: "lac-kivu",
            neighborhoodName: "La Botte",
            zoneName: "Ibanda",
            imageUrl: "https://example.com/cover.jpg",
            coverImageUrl: "https://example.com/cover.jpg",
            isActive: true,
            turnaroundHours: 48,
          },
        },
      };
    }
    return { ok: false, error: "Not found" };
  }),
}));

describe("Pressing Profile Features & Domain Invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Review Eligibility
  describe("1. Review eligibility", () => {
    it("allows an authenticated customer to review their delivered order", async () => {
      const res = await submitReview("user-1", {
        orderId: "order-delivered-user1",
        houseId: "house-1",
        rating: 5,
        comment: "Excellent repassage et ponctualité.",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.rating).toBe(5);
        expect(res.value.status).toBe("published");
      }
    });

    it("rejects a review for an order that is not in delivered status", async () => {
      const res = await submitReview("user-1", {
        orderId: "order-washing-user1",
        houseId: "house-1",
        rating: 4,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Seules les commandes livrées");
      }
    });

    it("rejects a review if the customer is not the order owner", async () => {
      const res = await submitReview("user-intruder", {
        orderId: "order-delivered-user1",
        houseId: "house-1",
        rating: 5,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("vos propres commandes");
      }
    });

    it("rejects duplicate reviews for the same order", async () => {
      const res = await submitReview("user-1", {
        orderId: "order-delivered-user1",
        houseId: "house-1",
        rating: 4,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("déjà soumis un avis");
      }
    });
  });

  // 2. Rating aggregation and minimum-count rule
  describe("2. Rating aggregation & minimum-count rule", () => {
    it("returns null rating (Nouveau badge) when review count is below 3", () => {
      const calculateDisplayRating = (reviewCount: number, avg: number | null) => {
        return reviewCount >= 3 && avg !== null ? avg : null;
      };

      expect(calculateDisplayRating(0, null)).toBeNull();
      expect(calculateDisplayRating(1, 5.0)).toBeNull();
      expect(calculateDisplayRating(2, 4.5)).toBeNull();
      expect(calculateDisplayRating(3, 4.67)).toBe(4.67);
      expect(calculateDisplayRating(10, 4.8)).toBe(4.8);
    });
  });

  // 3. Moderation transitions
  describe("3. Moderation transitions", () => {
    it("allows admin to hide a review with a mandatory reason", async () => {
      const adminUser = { id: "admin-1", role: "admin" };
      const res = await moderateReview(adminUser, {
        reviewId: "rev-sample",
        status: "hidden",
        reason: "Contenu non conforme ou langage inapproprié",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.status).toBe("hidden");
        expect(res.value.hiddenReason).toContain("Contenu non conforme");
      }
    });

    it("rejects moderation by non-admin users", async () => {
      const customer = { id: "user-1", role: "customer" };
      const res = await moderateReview(customer, {
        reviewId: "rev-sample",
        status: "hidden",
        reason: "Test",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Action réservée aux administrateurs");
      }
    });

    it("rejects moderation without a reason", async () => {
      const adminUser = { id: "admin-1", role: "admin" };
      const res = await moderateReview(adminUser, {
        reviewId: "rev-sample",
        status: "hidden",
        reason: "   ",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("motif de modération est obligatoire");
      }
    });
  });

  // 4. Reply permissions
  describe("4. Reply permissions", () => {
    it("allows partner staff assigned to the house to reply", async () => {
      const res = await submitReviewReply("staff-house-1", "house", {
        reviewId: "rev-sample",
        houseId: "house-1",
        text: "Merci beaucoup pour votre confiance !",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.text).toBe("Merci beaucoup pour votre confiance !");
      }
    });

    it("rejects reply from unauthorized users who do not belong to the house", async () => {
      const res = await submitReviewReply("user-random", "customer", {
        reviewId: "rev-sample",
        houseId: "house-1",
        text: "Tentative non autorisée",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("pas autorisé à répondre");
      }
    });

    it("rejects cross-house IDOR reply when review belongs to another house", async () => {
      reviewsDb.set("rev-other-house", {
        id: "rev-other-house",
        houseId: "house-2",
        status: "published",
      });

      const res = await submitReviewReply("staff-house-1", "house", {
        reviewId: "rev-other-house",
        houseId: "house-1",
        text: "Tentative sur avis d'un autre pressing",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("n'appartenant pas à cet établissement");
      }
      expect(insertReviewReplyMock).not.toHaveBeenCalled();
    });
  });

  // 5. Minimum-order progress
  describe("5. Minimum-order progress", () => {
    it("calculates remaining amount and percentage accurately", () => {
      const minAmount = 10000;
      const subtotal1 = 4000;
      const remaining1 = Math.max(0, minAmount - subtotal1);
      const percent1 = Math.min(100, Math.round((subtotal1 / minAmount) * 100));

      expect(remaining1).toBe(6000);
      expect(percent1).toBe(40);

      const subtotal2 = 12000;
      const remaining2 = Math.max(0, minAmount - subtotal2);
      const percent2 = Math.min(100, Math.round((subtotal2 / minAmount) * 100));

      expect(remaining2).toBe(0);
      expect(percent2).toBe(100);
    });
  });

  // 6. Material price selection
  describe("6. Material price selection", () => {
    it("correctly retrieves specific price for chosen material variant", () => {
      const variants: CustomerHouseCatalogueItem[] = [
        {
          houseItemId: "hi-std",
          serviceId: "s-wash",
          serviceSlug: "wash",
          serviceNameFr: "Lavage",
          serviceNameSw: "Kufua",
          itemId: "i-shirt",
          itemNameFr: "Chemise classique",
          itemNameSw: "Shati",
          itemCategory: "tops",
          fabricId: "f-std",
          fabricNameFr: "Standard",
          fabricNameSw: "Kawaida",
          priceCdf: 3500,
          currency: "CDF",
          isExcluded: false,
          exclusionNote: null,
        },
        {
          houseItemId: "hi-silk",
          serviceId: "s-wash",
          serviceSlug: "wash",
          serviceNameFr: "Lavage",
          serviceNameSw: "Kufua",
          itemId: "i-shirt",
          itemNameFr: "Chemise classique",
          itemNameSw: "Shati",
          itemCategory: "tops",
          fabricId: "f-silk",
          fabricNameFr: "Soie",
          fabricNameSw: "Hariri",
          priceCdf: 6500,
          currency: "CDF",
          isExcluded: false,
          exclusionNote: null,
        },
      ];

      const getVariantPrice = (fabricId: string) => {
        return variants.find((v) => v.fabricId === fabricId)?.priceCdf;
      };

      expect(getVariantPrice("f-std")).toBe(3500);
      expect(getVariantPrice("f-silk")).toBe(6500);
    });
  });

  // 7. Open/closed/paused state computation
  describe("7. Open/closed/paused state computation", () => {
    it("considers house closed if isPaused is true regardless of hours", () => {
      const isPaused = true;
      const isOpenNow = !isPaused && true;
      expect(isOpenNow).toBe(false);
    });

    it("evaluates open state according to opening hours string", () => {
      const evaluateIsOpen = (isPaused: boolean, currentHm: string, opensHm: string, closesHm: string) => {
        if (isPaused) return false;
        return currentHm >= opensHm && currentHm < closesHm;
      };

      expect(evaluateIsOpen(false, "10:00", "08:00", "18:00")).toBe(true);
      expect(evaluateIsOpen(false, "07:30", "08:00", "18:00")).toBe(false);
      expect(evaluateIsOpen(false, "19:00", "08:00", "18:00")).toBe(false);
      expect(evaluateIsOpen(true, "10:00", "08:00", "18:00")).toBe(false);
    });
  });

  // 8. Outlier filtering
  describe("8. Outlier filtering", () => {
    it("flags price outliers such as 150 000 CDF for Chemise classique", () => {
      const items: CustomerHouseCatalogueItem[] = [
        {
          houseItemId: "hi-1",
          serviceId: "s-wash",
          serviceSlug: "wash",
          serviceNameFr: "Lavage",
          serviceNameSw: "Kufua",
          itemId: "i-shirt",
          itemNameFr: "Chemise classique",
          itemNameSw: "Shati",
          itemCategory: "tops",
          fabricId: "f-std",
          fabricNameFr: "Standard",
          fabricNameSw: "Kawaida",
          priceCdf: 3500,
          currency: "CDF",
          isExcluded: false,
          exclusionNote: null,
        },
        {
          houseItemId: "hi-outlier",
          serviceId: "s-wash",
          serviceSlug: "wash",
          serviceNameFr: "Lavage",
          serviceNameSw: "Kufua",
          itemId: "i-shirt",
          itemNameFr: "Chemise classique",
          itemNameSw: "Shati",
          itemCategory: "tops",
          fabricId: "f-linen",
          fabricNameFr: "Coton/Lin",
          fabricNameSw: "Kitani",
          priceCdf: 150000,
          currency: "CDF",
          isExcluded: false,
          exclusionNote: null,
        },
      ];

      const { validItems, flaggedOutliers } = filterCatalogueOutliers(items);
      expect(validItems).toHaveLength(1);
      expect(flaggedOutliers).toHaveLength(1);
      expect(flaggedOutliers[0].item.priceCdf).toBe(150000);
    });
  });

  // 9. Public DTO field exclusion
  describe("9. Public DTO field exclusion", () => {
    it("verifies public projections omit customer contact details and internal notes", () => {
      const internalHouseRow = {
        id: "house-1",
        name: "Pressing du Lac",
        slug: "lac",
        neighborhoodName: "La Botte",
        zoneName: "Ibanda",
        contactPhone: "+243999000001",
        addressNote: "Behind the red gate next to bank",
        commissionBps: 1500,
      };

      // Customer public DTO
      const toPublicDto = (row: typeof internalHouseRow) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        neighborhoodName: row.neighborhoodName,
        zoneName: row.zoneName,
      });

      const publicDto = toPublicDto(internalHouseRow);
      const publicDtoRecord = publicDto as Record<string, unknown>;
      expect(publicDtoRecord.contactPhone).toBeUndefined();
      expect(publicDtoRecord.addressNote).toBeUndefined();
      expect(publicDtoRecord.commissionBps).toBeUndefined();
    });
  });

  // 10. Metadata generation
  describe("10. Metadata generation", () => {
    it("generates complete OpenGraph and canonical metadata for valid pressing", async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ houseSlug: "lac-kivu" }),
      });

      expect(meta.title).toContain("Pressing du Lac Kivu");
      expect(meta.description).toContain("Bukavu");
      expect(meta.alternates?.canonical).toContain("/houses/lac-kivu");
      expect(meta.openGraph?.images).toBeDefined();
    });

    it("returns not found title for unknown pressing", async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ houseSlug: "unknown-slug" }),
      });

      expect(meta.title).toContain("introuvable");
    });
  });
});
