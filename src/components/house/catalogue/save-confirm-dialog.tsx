"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/cash-formatters";
import type { CellDiff } from "./types";

interface SaveConfirmDialogProps {
  isOpen: boolean;
  diffs: CellDiff[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SaveConfirmDialog({
  isOpen,
  diffs,
  isSaving,
  onClose,
  onConfirm,
}: SaveConfirmDialogProps) {
  const t = useTranslations("house.catalogue");
  const [isListExpanded, setIsListExpanded] = useState(false);

  if (!isOpen) return null;

  const hasOutliers = diffs.some((d) => d.isOutlier);

  // Group diffs by service name for clean readability
  const groupedByService = new Map<string, CellDiff[]>();
  for (const d of diffs) {
    if (!groupedByService.has(d.serviceName)) {
      groupedByService.set(d.serviceName, []);
    }
    groupedByService.get(d.serviceName)!.push(d);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-dialog-title"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="save-dialog-title" className="text-base font-bold text-heading font-display">
              {t("confirmSaveTitle")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("confirmSaveDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-muted-foreground hover:text-heading p-1 rounded-lg"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Freeze rule notice */}
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-2.5 text-xs text-heading">
          <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-bold text-heading">{t("freezeNoticeTitle")} : </strong>
            <span className="text-muted-foreground">{t("confirmSaveNotice")}</span>
          </div>
        </div>

        {/* Outlier Warning banner */}
        {hasOutliers && (
          <div className="p-3 bg-warning-light text-warning-base rounded-xl border border-warning-base/20 flex items-start gap-2 text-xs">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="font-medium">{t("outlierWarning")}</span>
          </div>
        )}

        {/* Changes summary (scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-border/60 rounded-xl p-3 bg-surface/40 text-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-heading pb-1 border-b border-border/40">
            <span>{t("diffCount", { count: diffs.length })} :</span>
            {diffs.length > 5 && (
              <button
                type="button"
                onClick={() => setIsListExpanded(!isListExpanded)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                {isListExpanded ? t("collapse") : t("expandAll")}
                {isListExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {Array.from(groupedByService.entries()).map(([serviceName, items]) => {
              const displayItems = isListExpanded ? items : items.slice(0, 5);
              return (
                <div key={serviceName} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-primary font-display uppercase tracking-wide">
                    {serviceName}
                  </div>
                  <div className="space-y-1">
                    {displayItems.map((d) => (
                      <div
                        key={d.key}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-card border border-border/40 text-xs"
                      >
                        <div className="truncate min-w-0">
                          <span className="font-bold text-heading">{d.itemName}</span>
                          <span className="text-muted-foreground text-[11px] ml-1">({d.fabricName})</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                          {d.oldActive ? (
                            <span className="text-muted-foreground line-through">
                              {formatMoney(d.oldPrice, "CDF")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">{t("notOffered")}</span>
                          )}

                          <ArrowRight className="size-3 text-muted-foreground" aria-hidden="true" />

                          {d.newActive ? (
                            <span className="font-bold text-primary">
                              {formatMoney(d.newPrice, "CDF")}
                            </span>
                          ) : (
                            <span className="font-bold text-destructive">{t("withdrawn")}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!isListExpanded && items.length > 5 && (
                      <div className="text-[11px] text-muted-foreground italic text-center pt-0.5">
                        {t("moreChanges", { count: items.length - 5 })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs font-semibold rounded-xl"
          >
            {t("cancelChanges")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
            className="text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isSaving ? t("saving") : t("confirmButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
