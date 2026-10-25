"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PressingCategoryChips } from "./pressing-category-chips";

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

  const hasMultipleServices = services.length > 1;

  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border py-3 space-y-2.5 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5">
        {/* Row 1: Search & Service/Fabric Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              placeholder={t("searchArticles")}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-muted/60 hover:bg-muted focus:bg-card border border-border text-base sm:text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t("clearSearch")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Service tabs */}
            {hasMultipleServices && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
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

            {/* Fabric filter select */}
            {fabrics.length > 1 && (
              <Select
                value={activeFabricId || "all"}
                onValueChange={(val: string) => onSelectFabric(val === "all" ? null : val)}
              >
                <SelectTrigger className="h-auto px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-base sm:text-xs font-bold text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <SelectValue placeholder={t("allFabrics")} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectGroup>
                    <SelectItem value="all" className="bg-card text-foreground">{t("allFabrics")}</SelectItem>
                    {fabrics.map((f) => (
                      <SelectItem key={f.id} value={f.id} className="bg-card text-foreground">
                        {f.nameFr}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Row 2: Category chips jump bar & Row 3: Active filters */}
        <PressingCategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
          services={services}
          activeServiceSlug={activeServiceSlug}
          onSelectService={onSelectService}
          fabrics={fabrics}
          activeFabricId={activeFabricId}
          onSelectFabric={onSelectFabric}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
}
