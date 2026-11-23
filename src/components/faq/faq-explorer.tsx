"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  filterFaqItems,
  type FaqCategoryId,
  type LocalizedFaqItem,
} from "@/lib/faq-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaqAccordion } from "@/components/home/faq/faq-accordion";

export interface FaqCategoryOption {
  id: FaqCategoryId;
  label: string;
  count: number;
}

interface FaqExplorerProps {
  items: LocalizedFaqItem[];
  categories: FaqCategoryOption[];
}

export function FaqExplorer({ items, categories }: FaqExplorerProps) {
  const t = useTranslations("faq");
  const [category, setCategory] = useState<FaqCategoryId>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string>(items[0]?.id ?? "");

  const filtered = filterFaqItems(items, { category, query });
  const activeValue =
    openId === ""
      ? ""
      : filtered.some((item) => item.id === openId)
        ? openId
        : (filtered[0]?.id ?? "");

  const handleReset = () => {
    setCategory("all");
    setQuery("");
    setOpenId(items[0]?.id ?? "");
  };

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mb-14">
      {/* Search + Category Pills */}
      <div className="space-y-5 mb-8">
        <div className="relative">
          <Search
            className="size-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("page.searchPlaceholder")}
            aria-label={t("page.searchPlaceholder")}
            className="pl-11 pr-11 rounded-2xl border-border bg-card shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("page.searchClear")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-heading hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Tabs
          value={category}
          onValueChange={(next) => setCategory(next as FaqCategoryId)}
          className="w-full"
        >
          <TabsList className="h-auto w-full justify-start flex-wrap gap-2 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-heading hover:border-primary/40 data-selected:bg-primary data-selected:text-white data-selected:border-primary data-selected:shadow-xs transition-all cursor-pointer after:hidden"
              >
                <span>{cat.label}</span>
                <span className="ml-1.5 text-[11px] opacity-75">
                  ({cat.count})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <p className="text-xs font-medium text-muted-foreground">
          {t("page.resultsCount", { count: filtered.length })}
        </p>
      </div>

      {/* Accordion List (identical styling to homepage FAQ) or Empty State */}
      {filtered.length > 0 ? (
        <FaqAccordion
          items={filtered}
          value={activeValue}
          onValueChange={setOpenId}
        />
      ) : (
        <div className="rounded-2xl bg-card border border-border p-8 sm:p-10 text-center space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-heading">
              {t("page.emptyTitle")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("page.emptyDescription")}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("page.resetFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
