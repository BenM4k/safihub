"use client";

import { useState, Fragment } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, ChevronDown, ChevronRight, Copy, CheckSquare, Square } from "lucide-react";
import type {
  CatalogueCategoryGroup,
  CatalogueMaterial,
  CatalogueCellEdit,
  CatalogueArticle,
} from "./types";
import { PricingCell } from "./pricing-cell";
import { getCellKey } from "./catalogue-helpers";

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
        <table className="w-full border-collapse text-left text-xs">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xs text-muted-foreground font-semibold border-b border-border select-none">
            <tr>
              {/* Sticky first column header: Article name & bulk select */}
              <th className="sticky left-0 z-40 bg-surface py-3.5 px-4 min-w-[220px] max-w-[260px] border-r border-border font-bold text-heading">
                <div className="flex items-center gap-2">
                  <span>{t("itemCol")}</span>
                </div>
              </th>

              {/* Material columns */}
              {materials.map((mat) => {
                const isStandard = mat.nameFr.toLowerCase().includes("standard");
                return (
                  <th key={mat.id} className="py-3.5 px-3 min-w-[170px] text-heading font-bold">
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
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {categories.map((cat) => {
              const isCollapsed = collapsedCategories.has(cat.key);
              return (
                <Fragment key={cat.key}>
                  {/* Category Group Header Row */}
                  <tr className="bg-surface/70 hover:bg-surface border-y border-border">
                    <td
                      colSpan={materials.length + 1}
                      className="py-2.5 px-4 font-bold text-xs text-heading cursor-pointer select-none"
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
                          ({cat.articles.length} {t("itemCol").toLowerCase()}s)
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Articles in Category */}
                  {!isCollapsed &&
                    cat.articles.map((article) => {
                      const isSelected = selectedArticleIds.has(article.id);
                      return (
                        <tr
                          key={article.id}
                          className={`hover:bg-surface/40 transition group ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          {/* Sticky first column: Article Details & Bulk checkbox */}
                          <td className="sticky left-0 z-20 bg-card group-hover:bg-surface/80 py-3 px-4 border-r border-border min-w-[220px] max-w-[260px] align-top">
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => onToggleArticleSelect(article.id)}
                                className="mt-0.5 text-muted-foreground hover:text-primary transition shrink-0"
                                aria-label={`Sélectionner ${article.nameFr}`}
                              >
                                {isSelected ? (
                                  <CheckSquare className="size-4 text-primary" />
                                ) : (
                                  <Square className="size-4" />
                                )}
                              </button>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="font-bold text-heading text-xs leading-snug truncate">
                                  {article.nameFr}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onApplyPriceToAllFabrics(article)}
                                  className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
                                  title={t("applyAllFabrics")}
                                >
                                  <Copy className="size-3" aria-hidden="true" />
                                  <span>{t("applyAllFabrics")}</span>
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Material columns */}
                          {materials.map((mat) => {
                            const cell = article.cellsByFabricId.get(mat.id);
                            if (!cell) {
                              return (
                                <td key={mat.id} className="py-3 px-3 text-center text-muted-foreground font-mono">
                                  —
                                </td>
                              );
                            }
                            const cellKey = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
                            const currentEdit = edits[cellKey];

                            return (
                              <td key={mat.id} className="py-2.5 px-3 align-top min-w-[170px]">
                                <PricingCell
                                  item={cell}
                                  edit={currentEdit}
                                  commissionBps={commissionBps}
                                  onChange={(nextEdit) => onCellChange(cellKey, nextEdit)}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
