"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type {
  CatalogueServiceTab,
  CatalogueCategoryGroup,
  CatalogueFilterState,
  CatalogueCellEdit,
} from "./types";

export function useCatalogueFilter(
  services: CatalogueServiceTab[],
  categoriesByService: Map<string, CatalogueCategoryGroup[]>,
  edits: Record<string, CatalogueCellEdit>
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlService = searchParams.get("service");
  const activeServiceId =
    services.find((s) => s.id === urlService || s.slug === urlService)?.id ??
    services[0]?.id ??
    "";

  function handleSelectService(serviceId: string) {
    const srv = services.find((s) => s.id === serviceId);
    const param = srv ? srv.slug : serviceId;
    const params = new URLSearchParams(searchParams.toString());
    params.set("service", param);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const [filters, setFilters] = useState<CatalogueFilterState>({
    search: "",
    category: "all",
    status: "all",
  });

  const currentCategoryGroups = useMemo(
    () => categoriesByService.get(activeServiceId) ?? [],
    [categoriesByService, activeServiceId]
  );

  const filteredCategoryGroups = useMemo(() => {
    return currentCategoryGroups
      .map((cat) => {
        if (filters.category !== "all" && cat.key !== filters.category) return null;

        const filteredArticles = cat.articles.filter((art) => {
          if (
            filters.search.trim() &&
            !art.nameFr.toLowerCase().includes(filters.search.toLowerCase().trim())
          ) {
            return false;
          }

          if (filters.status !== "all") {
            const hasStatus = Array.from(art.cellsByFabricId.values()).some((cell) => {
              const key = `${cell.serviceId}_${cell.itemId}_${cell.fabricId}`;
              const edit = edits[key];
              const isOffered = edit !== undefined ? edit.isActive : cell.isActive;
              const price = edit !== undefined ? edit.price : cell.price;

              if (filters.status === "offered") return isOffered;
              if (filters.status === "not_offered") return !isOffered;
              if (filters.status === "no_price") return !price || price <= 0;
              return true;
            });
            if (!hasStatus) return false;
          }

          return true;
        });

        if (filteredArticles.length === 0) return null;
        return { ...cat, articles: filteredArticles };
      })
      .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
  }, [currentCategoryGroups, filters, edits]);

  const totalFilteredArticles = filteredCategoryGroups.reduce(
    (acc, c) => acc + c.articles.length,
    0
  );

  return {
    activeServiceId,
    handleSelectService,
    filters,
    setFilters,
    currentCategoryGroups,
    filteredCategoryGroups,
    totalFilteredArticles,
  };
}
