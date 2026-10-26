"use client";

import { CheckSquare, Copy, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import type {
  CatalogueArticle,
  CatalogueCellEdit,
  CatalogueMaterial,
} from "./types";
import { PricingCell } from "./pricing-cell";
import { getCellKey } from "./catalogue-helpers";

interface DesktopPricingRowProps {
  article: CatalogueArticle;
  materials: CatalogueMaterial[];
  edits: Record<string, CatalogueCellEdit>;
  commissionBps?: number | null;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCellChange: (key: string, edit: CatalogueCellEdit) => void;
  onApplyPriceToAllFabrics: () => void;
}

export function DesktopPricingRow({
  article,
  materials,
  edits,
  commissionBps,
  isSelected,
  onToggleSelect,
  onCellChange,
  onApplyPriceToAllFabrics,
}: DesktopPricingRowProps) {
  const t = useTranslations("house.catalogue");

  return (
    <TableRow
      className={`hover:bg-muted/30 transition group ${
        isSelected ? "bg-primary/5" : ""
      }`}
    >
      {/* Sticky first column: Article Details & Bulk checkbox */}
      <TableCell className="sticky left-0 z-20 bg-card group-hover:bg-muted/50 py-3 px-4 border-r border-border min-w-[220px] max-w-[260px] align-top">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={onToggleSelect}
            className="mt-0.5 text-muted-foreground hover:text-primary transition shrink-0 cursor-pointer"
            aria-label={t("selectArticleAria", { name: article.nameFr })}
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
              onClick={onApplyPriceToAllFabrics}
              className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition cursor-pointer"
              title={t("applyAllFabrics")}
            >
              <Copy className="size-3" aria-hidden="true" />
              <span>{t("applyAllFabrics")}</span>
            </button>
          </div>
        </div>
      </TableCell>

      {/* Material columns */}
      {materials.map((mat) => {
        const cell = article.cellsByFabricId.get(mat.id);
        if (!cell) {
          return (
            <TableCell
              key={mat.id}
              className="py-3 px-3 text-center text-muted-foreground font-mono"
            >
              —
            </TableCell>
          );
        }
        const cellKey = getCellKey(cell.serviceId, cell.itemId, cell.fabricId);
        const currentEdit = edits[cellKey];

        return (
          <TableCell
            key={mat.id}
            className="py-2.5 px-3 align-top min-w-[170px]"
          >
            <PricingCell
              item={cell}
              edit={currentEdit}
              commissionBps={commissionBps}
              onChange={(nextEdit) => onCellChange(cellKey, nextEdit)}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}
