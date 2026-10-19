"use client";

import { useMemo, useState } from "react";
import type { CustomerHouseCatalogueItem } from "@/dal";

export interface GroupedArticle {
  key: string;
  itemId: string;
  itemNameFr: string;
  itemCategory: string;
  serviceId: string;
  serviceSlug: string;
  serviceNameFr: string;
  variants: CustomerHouseCatalogueItem[];
}

export function usePressingArticles(items: CustomerHouseCatalogueItem[]) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(null);
  const [activeFabricId, setActiveFabricId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Group items into unique articles
  const groupedArticles = useMemo(() => {
    const groups = new Map<string, GroupedArticle>();
    for (const item of items) {
      const groupKey = `${item.serviceId}_${item.itemId}`;
      const existing = groups.get(groupKey);
      if (existing) {
        existing.variants.push(item);
      } else {
        groups.set(groupKey, {
          key: groupKey,
          itemId: item.itemId,
          itemNameFr: item.itemNameFr,
          itemCategory: item.itemCategory || "clothing",
          serviceId: item.serviceId,
          serviceSlug: item.serviceSlug,
          serviceNameFr: item.serviceNameFr,
          variants: [item],
        });
      }
    }
    return Array.from(groups.values());
  }, [items]);

  // Category counts
  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const art of groupedArticles) {
      counts.set(art.itemCategory, (counts.get(art.itemCategory) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([key, count]) => ({ key, count }));
  }, [groupedArticles]);

  // Unique fabrics
  const uniqueFabrics = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.fabricId, item.fabricNameFr);
    }
    return Array.from(map.entries()).map(([id, nameFr]) => ({ id, nameFr }));
  }, [items]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return groupedArticles.filter((art) => {
      if (activeCategory && art.itemCategory !== activeCategory) return false;
      if (activeServiceSlug && art.serviceSlug !== activeServiceSlug) return false;
      if (
        activeFabricId &&
        !art.variants.some((v) => v.fabricId === activeFabricId && !v.isExcluded)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!art.itemNameFr.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [groupedArticles, activeCategory, activeServiceSlug, activeFabricId, searchQuery]);

  return {
    activeCategory,
    setActiveCategory,
    activeServiceSlug,
    setActiveServiceSlug,
    activeFabricId,
    setActiveFabricId,
    searchQuery,
    setSearchQuery,
    categoriesWithCounts,
    uniqueFabrics,
    filteredArticles,
  };
}
