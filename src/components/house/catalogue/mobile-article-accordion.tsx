"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Copy, CheckSquare, Square } from "lucide-react";
import type {
  CatalogueCategoryGroup,
  CatalogueMaterial,
  CatalogueCellEdit,
  CatalogueArticle,
} from "./types";
import { PricingCell } from "./pricing-cell";
import { getCellKey } from "./catalogue-helpers";

interface MobileArticleAccordionProps {
  categories: CatalogueCategoryGroup[];
  materials: CatalogueMaterial[];
  edits: Record<string, CatalogueCellEdit>;
  commissionBps?: number | null;
  selectedArticleIds: Set<string>;
  onToggleArticleSelect: (articleId: string) => void;
  onCellChange: (key: string, edit: CatalogueCellEdit) => void;
  onApplyPriceToAllFabrics: (article: CatalogueArticle) => void;
}

export function MobileArticleAccordion({
  categories,
  materials,
  edits,
  commissionBps,
  selectedArticleIds,
  onToggleArticleSelect,
  onCellChange,
  onApplyPriceToAllFabrics,
}: MobileArticleAccordionProps) {
  const t = useTranslations("house.catalogue");
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  function toggleArticle(articleId: string) {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  }

  return (
    <div className="block md:hidden space-y-4">
      {categories.map((cat) => (
        <div key={cat.key} className="space-y-2">
          {/* Category Header */}
          <div className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground px-1">
            {cat.label} ({cat.articles.length})
          </div>

          <div className="space-y-2">
            {cat.articles.map((article) => {
              const isExpanded = expandedArticles.has(article.id);
              const isSelected = selectedArticleIds.has(article.id);

              // Count offered materials for this article
              let offeredCount = 0;
              for (const mat of materials) {
                const cell = article.cellsByFabricId.get(mat.id);
                if (cell) {
                  const key = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
                  const edit = edits[key];
                  const active = edit !== undefined ? edit.isActive : cell.isActive;
                  if (active) offeredCount++;
                }
              }

              return (
                <div
                  key={article.id}
                  className={`bg-card rounded-2xl border transition shadow-xs overflow-hidden ${
                    isSelected ? "border-primary ring-1 ring-primary/20" : "border-border"
                  }`}
                >
                  {/* Article Accordion Header (44px target) */}
                  <div className="p-3.5 flex items-center justify-between gap-3 min-h-[44px]">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleArticleSelect(article.id)}
                        className="text-muted-foreground hover:text-primary p-1 rounded-lg"
                        aria-label={`Sélectionner ${article.nameFr}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="size-4 text-primary" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleArticle(article.id)}
                        className="flex-1 text-left min-w-0 flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-xs text-heading truncate">
                          {article.nameFr}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground bg-surface px-2 py-0.5 rounded-full shrink-0">
                          {offeredCount}/{materials.length} {t("offered").toLowerCase()}
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleArticle(article.id)}
                      className="size-8 rounded-lg flex items-center justify-center hover:bg-surface text-muted-foreground"
                      aria-label="Ouvrir le détail des matières"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Material Rows */}
                  {isExpanded && (
                    <div className="border-t border-border bg-surface/30 p-3 space-y-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onApplyPriceToAllFabrics(article)}
                          className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                        >
                          <Copy className="size-3.5" aria-hidden="true" />
                          <span>{t("applyAllFabrics")}</span>
                        </button>
                      </div>

                      <div className="divide-y divide-border/60">
                        {materials.map((mat) => {
                          const cell = article.cellsByFabricId.get(mat.id);
                          if (!cell) return null;
                          const cellKey = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
                          const currentEdit = edits[cellKey];

                          return (
                            <div key={mat.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                              <div className="text-xs font-semibold text-heading flex items-center justify-between">
                                <span>{mat.nameFr}</span>
                              </div>
                              <PricingCell
                                item={cell}
                                edit={currentEdit}
                                commissionBps={commissionBps}
                                onChange={(nextEdit) => onCellChange(cellKey, nextEdit)}
                                isMobileLayout
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
