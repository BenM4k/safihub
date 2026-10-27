"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col font-sans">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-heading font-display">
            {t("confirmSaveTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("confirmSaveDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Freeze rule notice */}
        <Alert className="bg-primary/5 border-primary/20 text-xs py-2.5">
          <ShieldCheck className="size-4 text-primary" />
          <AlertDescription className="text-xs text-muted-foreground">
            <strong className="font-bold text-heading mr-1">{t("freezeNoticeTitle")} :</strong>
            <span>{t("confirmSaveNotice")}</span>
          </AlertDescription>
        </Alert>

        {/* Outlier Warning banner */}
        {hasOutliers && (
          <Alert variant="destructive" className="bg-warning-soft text-warning border-warning/30 text-xs py-2.5">
            <AlertTriangle className="size-4 text-warning" />
            <AlertDescription className="text-xs font-medium text-warning">
              {t("outlierWarning")}
            </AlertDescription>
          </Alert>
        )}

        {/* Changes summary (scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-border/60 rounded-xl p-3 bg-muted/30 text-xs max-h-60">
          <div className="flex items-center justify-between text-xs font-semibold text-heading pb-1 border-b border-border/40">
            <span>{t("diffCount", { count: diffs.length })} :</span>
            {diffs.length > 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsListExpanded(!isListExpanded)}
                className="text-[11px] text-primary hover:bg-primary/10 h-6 px-1.5 gap-1"
              >
                <span>{isListExpanded ? t("collapse") : t("expandAll")}</span>
                {isListExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </Button>
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

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 sm:flex-initial h-10 sm:h-9 text-xs font-semibold rounded-xl"
          >
            {t("cancelChanges")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
            className="flex-1 sm:flex-initial h-10 sm:h-9 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isSaving ? t("saving") : t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
