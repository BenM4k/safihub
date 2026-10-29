import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  getNeighborhoods,
  getZones,
  getZoneFees,
  getLatestExchangeRate,
  getHouseReviews,
  getHouseRatingStats,
  type NeighborhoodRecord,
  type ZoneRecord,
  type ZoneFeeRecord,
  type ExchangeRateRecord,
  type CustomerHouseDetailData,
  type HouseReviewItem,
  type HouseReviewStatsData,
} from "@/dal";
import {
  getCustomerHousesData,
  getCustomerHouseProfile,
  type CustomerHouseSearchFilter,
  type CustomerHousesPageData,
} from "@/services/house";
import type { Result } from "@/lib/result";
import { CACHE_TAGS } from "./cache-tags";

function safeCacheConfig(
  profile: "minutes" | "hours",
  ...tags: string[]
): void {
  try {
    if (profile === "hours") {
      cacheLife("hours");
    } else {
      cacheLife("minutes");
    }
    if (tags.length > 0) {
      cacheTag(...tags);
    }
  } catch {
    // No-op when invoked directly inside unit test runners outside Next.js workUnitAsyncStorage
  }
}

function safeCacheTag(...tags: string[]): void {
  try {
    if (tags.length > 0) {
      cacheTag(...tags);
    }
  } catch {
    // No-op when invoked directly inside unit test runners outside Next.js workUnitAsyncStorage
  }
}

export async function getCachedNeighborhoods(): Promise<NeighborhoodRecord[]> {
  "use cache";
  safeCacheConfig("hours", CACHE_TAGS.coverageZones);
  return getNeighborhoods();
}

export async function getCachedZones(): Promise<ZoneRecord[]> {
  "use cache";
  safeCacheConfig("hours", CACHE_TAGS.coverageZones);
  return getZones();
}

export async function getCachedZoneFees(): Promise<ZoneFeeRecord[]> {
  "use cache";
  safeCacheConfig("hours", CACHE_TAGS.coverageZones);
  return getZoneFees();
}

export async function getCachedExchangeRate(
  baseCurrency: "CDF" | "USD" = "USD",
  quoteCurrency: "CDF" | "USD" = "CDF"
): Promise<ExchangeRateRecord | null> {
  "use cache";
  safeCacheConfig("hours", CACHE_TAGS.catalogItems);
  return getLatestExchangeRate(baseCurrency, quoteCurrency);
}

export async function getCachedCustomerHousesData(
  filter: CustomerHouseSearchFilter = {}
): Promise<CustomerHousesPageData> {
  "use cache";
  safeCacheConfig(
    "minutes",
    CACHE_TAGS.housesList,
    CACHE_TAGS.coverageZones,
    CACHE_TAGS.catalogItems
  );
  return getCustomerHousesData(filter);
}

export async function getCachedCustomerHouseProfile(
  houseSlugOrId: string
): Promise<Result<CustomerHouseDetailData>> {
  "use cache";
  safeCacheConfig(
    "minutes",
    CACHE_TAGS.housesList,
    CACHE_TAGS.house(houseSlugOrId),
    CACHE_TAGS.coverageZones,
    CACHE_TAGS.catalogItems
  );
  const res = await getCustomerHouseProfile(houseSlugOrId);
  if (res.ok) {
    safeCacheTag(
      CACHE_TAGS.house(res.value.house.id),
      CACHE_TAGS.house(res.value.house.slug)
    );
  }
  return res;
}

export async function getCachedHouseReviews(
  houseId: string,
  limit = 10
): Promise<{ reviews: HouseReviewItem[]; total: number }> {
  "use cache";
  safeCacheConfig("minutes", CACHE_TAGS.house(houseId));
  return getHouseReviews(houseId, { limit });
}

export async function getCachedHouseRatingStats(
  houseId: string
): Promise<HouseReviewStatsData> {
  "use cache";
  safeCacheConfig("minutes", CACHE_TAGS.house(houseId));
  return getHouseRatingStats(houseId);
}
