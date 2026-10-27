"use client";

import { useState, Fragment } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CatalogueCategoryGroup,
  CatalogueMaterial,
  CatalogueCellEdit,
  CatalogueArticle,
} from "./types";
import { DesktopPricingRow } from "./desktop-pricing-row";

interface DesktopPricingGridProps {
  categories: CatalogueCategoryGroup[];
  materials: CatalogueMaterial[];
  edits: Record<string, CatalogueCellEdit>;
  commissionBps?: number | null;
  selectedArticleIds: Set<string>;
  onToggleArticleSelect: (articleId: string) => void;
  onCellChange: (key: string, edit: CatalogueCellEdit) => void;
  onApplyPriceToAllFabrics: (article: CatalogueArticle) => void;
}

export function DesktopPricingGrid({
  categories,
  materials,
  edits,
  commissionBps,
  selectedArticleIds,
  onToggleArticleSelect,
  onCellChange,
  onApplyPriceToAllFabrics,
}: DesktopPricingGridProps) {
  const t = useTranslations("house.catalogue");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  function toggleCategory(key: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="hidden md:block bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="border-collapse text-left text-xs">
          {/* Sticky Table Header */}
          <TableHeader className="sticky top-0 z-30 bg-muted/80 backdrop-blur-xs select-none">
            <TableRow className="border-b border-border">
              {/* Sticky first column header: Article name & bulk select */}
              <TableHead className="sticky left-0 z-40 bg-muted py-4 px-5 min-w-[220px] max-w-[260px] border-r border-border font-bold text-heading">
                <div className="flex items-center gap-2">
                  <span>{t("itemCol")}</span>
                </div>
              </TableHead>

              {/* Material columns */}
              {materials.map((mat) => {
                const isStandard = mat.nameFr.toLowerCase().includes("standard");
                return (
                  <TableHead key={mat.id} className="py-4 px-4 min-w-[170px] text-heading font-bold">
                    <div className="flex items-center gap-1.5">
                      <span>{mat.nameFr}</span>
                      {isStandard && (
                        <span
                          className="text-muted-foreground hover:text-heading cursor-help"
                          title={t("standardTooltip")}
                          aria-label={t("standardTooltip")}
                        >
                          <HelpCircle className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border">
            {categories.map((cat) => {
              const isCollapsed = collapsedCategories.has(cat.key);
              return (
                <Fragment key={cat.key}>
                  {/* Category Group Header Row */}
                  <TableRow className="bg-muted/40 hover:bg-muted/60 border-y border-border">
                    <TableCell
                      colSpan={materials.length + 1}
                      className="py-3 px-5 font-bold text-xs text-heading cursor-pointer select-none"
                      onClick={() => toggleCategory(cat.key)}
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-display tracking-tight text-xs uppercase">
                          {cat.label}
                        </span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          ({t("articleCount", { count: cat.articles.length })})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Articles in Category */}
                  {!isCollapsed &&
                    cat.articles.map((article) => (
                      <DesktopPricingRow
                        key={article.id}
                        article={article}
                        materials={materials}
                        edits={edits}
                        commissionBps={commissionBps}
                        isSelected={selectedArticleIds.has(article.id)}
                        onToggleSelect={() => onToggleArticleSelect(article.id)}
                        onCellChange={onCellChange}
                        onApplyPriceToAllFabrics={() => onApplyPriceToAllFabrics(article)}
                      />
                    ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
