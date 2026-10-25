"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryCount, ServiceOption } from "./pressing-category-nav";

interface PressingCategoryChipsProps {
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

export function PressingCategoryChips({
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
}: PressingCategoryChipsProps) {
  const t = useTranslations("customerHouses");
  const tCat = useTranslations("catalogCategories");

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
    <>
      {/* Category chips jump bar */}
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

      {/* Removable Active Filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="font-semibold text-muted-foreground">{t("activeFilters")}</span>
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border font-semibold text-[11px]">
              {getCategoryLabel(activeCategory)}
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
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
                className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
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
                className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
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
                className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
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
    </>
  );
}
