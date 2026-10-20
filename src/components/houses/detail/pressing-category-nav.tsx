"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface ServiceOption {
  id: string;
  slug: string;
  nameFr: string;
  nameSw: string;
}

export interface CategoryCount {
  key: string;
  count: number;
}

interface PressingCategoryNavProps {
  categories: CategoryCount[];
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  services: ServiceOption[];
  activeServiceSlug: string | null;
  onSelectService: (slug: string | null) => void;
  fabrics: Array<{ id: string; nameFr: string }>;
  activeFabricId: string | null;
  onSelectFabric: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PressingCategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
  services,
  activeServiceSlug,
  onSelectService,
  fabrics,
  activeFabricId,
  onSelectFabric,
  searchQuery,
  onSearchChange,
}: PressingCategoryNavProps) {
  const t = useTranslations("customerHouses");
  const tCat = useTranslations("catalogCategories");

  const hasMultipleServices = services.length > 1;
  const hasActiveFilters = Boolean(
    activeCategory || activeServiceSlug || activeFabricId || searchQuery.trim()
  );

  const getCategoryLabel = (catKey: string): string => {
    try {
      return tCat(catKey as Parameters<typeof tCat>[0]);
    } catch {
      return catKey;
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border py-3 space-y-2.5 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5">
        {/* Row 1: Search & Service/Fabric Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar with min 16px font size */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchArticles")}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/60 hover:bg-muted focus:bg-card border border-border text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Service tabs (only if multiple services exist) */}
          {hasMultipleServices && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-muted border border-border">
              <button
                type="button"
                onClick={() => onSelectService(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeServiceSlug === null
                    ? "bg-card text-heading shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("allServices")}
              </button>
              {services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onSelectService(srv.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeServiceSlug === srv.slug
                      ? "bg-card text-heading shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {srv.nameFr}
                </button>
              ))}
            </div>
          )}

          {/* Fabric filter select with min 16px font size */}
          {fabrics.length > 1 && (
            <select
              value={activeFabricId || ""}
              onChange={(e) => onSelectFabric(e.target.value || null)}
              className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-base font-bold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{t("allFabrics")}</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nameFr}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Row 2: Category chips jump bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
              activeCategory === null
                ? "bg-primary text-white shadow-2xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Tous ({categories.reduce((acc, c) => acc + c.count, 0)})
          </button>
          {categories.map((c) => {
            const isSelected = activeCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onSelectCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {getCategoryLabel(c.key)} ({c.count})
              </button>
            );
          })}
        </div>

        {/* Row 3: Removable Active Filter pills */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="font-semibold text-muted-foreground">{t("activeFilters")}</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border font-semibold text-[11px]">
                {getCategoryLabel(activeCategory)}
                <button
                  type="button"
                  onClick={() => onSelectCategory(null)}
                  className="hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {activeServiceSlug && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border font-semibold text-[11px]">
                {services.find((s) => s.slug === activeServiceSlug)?.nameFr}
                <button
                  type="button"
                  onClick={() => onSelectService(null)}
                  className="hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {activeFabricId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border font-semibold text-[11px]">
                {fabrics.find((f) => f.id === activeFabricId)?.nameFr}
                <button
                  type="button"
                  onClick={() => onSelectFabric(null)}
                  className="hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border font-semibold text-[11px]">
                &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                onSelectService(null);
                onSelectFabric(null);
                onSearchChange("");
              }}
              className="text-primary hover:underline text-[11px] font-bold ml-1 cursor-pointer"
            >
              {t("clearAllFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
