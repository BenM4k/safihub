import { useMemo, useState } from "react";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import type { CoverageFilterStatus } from "./types";

interface UseCoverageFiltersParams {
  items: HouseCoverageWithLimitsItem[];
  coveredMap: Record<string, boolean>;
}

export function useCoverageFilters({ items, coveredMap }: UseCoverageFiltersParams) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CoverageFilterStatus>("all");

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const isCovered = Boolean(coveredMap[item.neighborhoodId]);

      if (filterStatus === "served" && !isCovered) return false;
      if (filterStatus === "not_served" && isCovered) return false;

      if (q) {
        const nameMatch = item.neighborhoodName.toLowerCase().includes(q);
        const zoneMatch = item.zoneName.toLowerCase().includes(q);
        if (!nameMatch && !zoneMatch) return false;
      }

      return true;
    });
  }, [items, coveredMap, searchQuery, filterStatus]);

  const groupedZones = useMemo(() => {
    const map = new Map<string, HouseCoverageWithLimitsItem[]>();
    for (const item of filteredItems) {
      if (!map.has(item.zoneName)) {
        map.set(item.zoneName, []);
      }
      map.get(item.zoneName)!.push(item);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  const filterCounts = useMemo(() => {
    const all = items.length;
    const served = items.filter((i) => Boolean(coveredMap[i.neighborhoodId])).length;
    const notServed = all - served;
    return { all, served, notServed };
  }, [items, coveredMap]);

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filteredItems,
    groupedZones,
    filterCounts,
  };
}
