"use client";

import { useTranslations } from "next-intl";
import { Loader2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverageSaveBarProps {
  dirtyCount: number;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function CoverageSaveBar({
  dirtyCount,
  isSaving,
  onCancel,
  onSave,
}: CoverageSaveBarProps) {
  const t = useTranslations("house.coverage");

  if (dirtyCount === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={t("saveChanges")}
      className="fixed bottom-22 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[95%] max-w-xl bg-card text-foreground rounded-2xl p-3 sm:p-4 shadow-lift border border-border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="size-2 rounded-full bg-warning animate-pulse shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs sm:text-sm font-bold truncate text-foreground font-display">
          {t("unsavedChanges", { count: dirtyCount })}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 sm:h-9 px-3.5 text-xs font-semibold rounded-lg border-border hover:bg-muted/40 text-foreground cursor-pointer"
        >
          <Undo2 className="size-3.5 mr-1" aria-hidden="true" />
          <span>{t("cancelChanges")}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="h-10 sm:h-9 px-4 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs transition cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" aria-hidden="true" />
              <span>{t("saving")}</span>
            </>
          ) : (
            <>
              <Save className="size-3.5 mr-1.5" aria-hidden="true" />
              <span>{t("saveChanges")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
