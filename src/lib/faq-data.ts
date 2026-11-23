export type FaqCategoryId =
  | "all"
  | "orders"
  | "payment"
  | "delivery"
  | "care"
  | "partners";

export type FaqItemId =
  | "paymentMethods"
  | "threePointCount"
  | "turnaroundTimes"
  | "coverageZones"
  | "delicateFabrics"
  | "howOrderingWorks"
  | "acceptanceTimeout"
  | "guestTracking"
  | "cancelOrder"
  | "excludedItems"
  | "deliveryFees"
  | "pickupWindows"
  | "deliveryCode"
  | "conditionPhotosPrivacy"
  | "becomePartner";

export type FaqLinkKey = "trackPage" | "partnerApply";

export interface FaqInlineLink {
  label: string;
  href: string;
}

export interface FaqItemMeta {
  id: FaqItemId;
  category: Exclude<FaqCategoryId, "all">;
  featured?: boolean;
  links?: ReadonlyArray<{ key: FaqLinkKey; href: string }>;
}

export interface LocalizedFaqItem {
  id: string;
  category: Exclude<FaqCategoryId, "all">;
  categoryLabel: string;
  question: string;
  answer: string;
  links?: FaqInlineLink[];
}

export const FAQ_CATEGORIES: readonly FaqCategoryId[] = [
  "all",
  "orders",
  "payment",
  "delivery",
  "care",
  "partners",
] as const;

export const FAQ_ITEMS_META: readonly FaqItemMeta[] = [
  { id: "paymentMethods", category: "payment", featured: true },
  { id: "threePointCount", category: "care", featured: true },
  { id: "turnaroundTimes", category: "delivery", featured: true },
  { id: "coverageZones", category: "delivery", featured: true },
  { id: "delicateFabrics", category: "care", featured: true },
  { id: "howOrderingWorks", category: "orders" },
  { id: "acceptanceTimeout", category: "orders" },
  {
    id: "guestTracking",
    category: "orders",
    links: [{ key: "trackPage", href: "/track" }],
  },
  { id: "cancelOrder", category: "orders" },
  { id: "excludedItems", category: "payment" },
  { id: "deliveryFees", category: "payment" },
  { id: "pickupWindows", category: "delivery" },
  { id: "deliveryCode", category: "delivery" },
  { id: "conditionPhotosPrivacy", category: "care" },
  {
    id: "becomePartner",
    category: "partners",
    links: [{ key: "partnerApply", href: "/partners/apply" }],
  },
] as const;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterFaqItems(
  items: LocalizedFaqItem[],
  filters: { category: FaqCategoryId; query: string }
): LocalizedFaqItem[] {
  const normalizedQuery = normalizeText(filters.query);

  return items.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (!normalizedQuery) return true;

    return (
      normalizeText(item.question).includes(normalizedQuery) ||
      normalizeText(item.answer).includes(normalizedQuery) ||
      normalizeText(item.categoryLabel).includes(normalizedQuery)
    );
  });
}
