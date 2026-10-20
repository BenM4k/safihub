"use client";

import { useState, useRef, useMemo } from "react";
import { Calendar, CheckSquare, Loader2, Square, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";
import { getDrcHolidaysForYear } from "@/lib/drc-holidays";
import { formatDateFr } from "@/lib/hours-utils";

interface HolidaysImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (holidays: Array<{ startsOn: string; endsOn: string; reason: string }>) => Promise<{ ok: boolean; error?: string }>;
}

export function HolidaysImportModal({
  isOpen,
  onClose,
  onImport,
}: HolidaysImportModalProps) {
  const t = useTranslations("house.hours");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef,
    trapTab: true,
  });

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const holidays = useMemo(() => getDrcHolidaysForYear(selectedYear), [selectedYear]);

  // Preselect future holidays by default
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    holidays.filter((h) => !h.isPast).map((h) => h.id)
  );
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function toggleHoliday(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedIds(holidays.map((h) => h.id));
  }

  function handleDeselectAll() {
    setSelectedIds([]);
  }

  async function handleConfirm() {
    const toImport = holidays
      .filter((h) => selectedIds.includes(h.id))
      .map((h) => ({
        startsOn: h.date,
        endsOn: h.date,
        reason: h.name,
      }));

    if (toImport.length === 0) {
      setErrorMsg("Veuillez sélectionner au moins un jour férié.");
      return;
    }

    setIsPending(true);
    setErrorMsg(null);

    const res = await onImport(toImport);
    setIsPending(false);

    if (!res.ok) {
      setErrorMsg(res.error || "Une erreur est survenue lors de l'importation.");
    } else {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="holidays-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-lift flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Calendar className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="holidays-modal-title" className="text-base sm:text-lg font-bold text-heading font-display">
                {t("importHolidaysTitle")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("importHolidaysDesc")}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Toolbar: year selector & select/deselect */}
        <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-heading">Année :</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                const yr = Number(e.target.value);
                setSelectedYear(yr);
                setSelectedIds(getDrcHolidaysForYear(yr).filter((h) => !h.isPast).map((h) => h.id));
              }}
              className="h-7 px-2 rounded-md border border-border bg-card text-xs font-semibold focus:ring-2 focus:ring-primary/20"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear + 1}>{currentYear + 1}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Tout cocher
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Tout décocher
            </button>
          </div>
        </div>

        {/* List of holidays */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-border">
          {holidays.map((h) => {
            const isChecked = selectedIds.includes(h.id);
            return (
              <label
                key={h.id}
                className={`p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                  isChecked ? "bg-primary-soft/40" : "hover:bg-surface"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleHoliday(h.id)}
                    className="sr-only"
                  />
                  {isChecked ? (
                    <CheckSquare className="size-4 text-primary shrink-0" aria-hidden="true" />
                  ) : (
                    <Square className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-heading block truncate">
                      {h.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateFr(h.date)}
                    </span>
                  </div>
                </div>

                {h.isPast && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">
                    Passé
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {errorMsg && (
          <div className="px-4 py-2 bg-destructive-soft text-destructive text-xs font-semibold border-t border-destructive/20">
            {errorMsg}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-card">
          <span className="text-xs text-muted-foreground font-medium">
            {selectedIds.length} jour{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="h-10 text-xs font-semibold cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isPending || selectedIds.length === 0}
              onClick={handleConfirm}
              className="h-10 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" aria-hidden="true" />}
              <span>{t("importHolidaysConfirm")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
