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
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 space-y-2.5 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5">
        {/* Row 1: Search & Service/Fabric Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchArticles")}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Service tabs (only if multiple services exist) */}
          {hasMultipleServices && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectService(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeServiceSlug === null
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("allServices")}
              </button>
              {services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => onSelectService(srv.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeServiceSlug === srv.slug
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {srv.nameFr}
                </button>
              ))}
            </div>
          )}

          {/* Fabric filter select */}
          {fabrics.length > 1 && (
            <select
              value={activeFabricId || ""}
              onChange={(e) => onSelectFabric(e.target.value || null)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <span className="font-semibold text-slate-400">{t("activeFilters")}</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[11px]">
                {getCategoryLabel(activeCategory)}
                <button
                  type="button"
                  onClick={() => onSelectCategory(null)}
                  className="hover:text-rose-600"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {activeServiceSlug && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[11px]">
                {services.find((s) => s.slug === activeServiceSlug)?.nameFr}
                <button
                  type="button"
                  onClick={() => onSelectService(null)}
                  className="hover:text-rose-600"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {activeFabricId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[11px]">
                {fabrics.find((f) => f.id === activeFabricId)?.nameFr}
                <button
                  type="button"
                  onClick={() => onSelectFabric(null)}
                  className="hover:text-rose-600"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[11px]">
                &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-rose-600"
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
              className="text-primary hover:underline text-[11px] font-bold ml-1"
            >
              {t("clearAllFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
