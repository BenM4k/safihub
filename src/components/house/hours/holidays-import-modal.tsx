"use client";

import { useState, useMemo } from "react";
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDrcHolidaysForYear } from "@/lib/drc-holidays";
import { HolidaysListItem } from "./holidays-list-item";

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
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const holidays = useMemo(() => getDrcHolidaysForYear(selectedYear), [selectedYear]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    holidays.filter((h) => !h.isPast).map((h) => h.id)
  );
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleHoliday(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleConfirm() {
    const toImport = holidays
      .filter((h) => selectedIds.includes(h.id))
      .map((h) => ({ startsOn: h.date, endsOn: h.date, reason: h.name }));

    if (toImport.length === 0) {
      setErrorMsg(t("selectAtLeastOneHoliday"));
      return;
    }

    setIsPending(true);
    setErrorMsg(null);
    const res = await onImport(toImport);
    setIsPending(false);

    if (!res.ok) {
      setErrorMsg(res.error || t("importError"));
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-6 rounded-2xl bg-card border border-border space-y-4 font-sans overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Calendar className="size-5 text-primary shrink-0" aria-hidden="true" />
            <DialogTitle className="text-base sm:text-lg font-bold text-heading font-display tracking-tight">
              {t("importHolidaysTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("importHolidaysDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-2 text-xs shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <span className="font-semibold text-heading">{t("yearLabel")}</span>
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => {
                const yr = Number(val);
                setSelectedYear(yr);
                setSelectedIds(getDrcHolidaysForYear(yr).filter((h) => !h.isPast).map((h) => h.id));
              }}
            >
              <SelectTrigger className="h-8 sm:h-8 w-28 text-base sm:text-xs font-semibold rounded-lg border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-sans rounded-xl bg-card border border-border shadow-lift">
                <SelectItem value={String(currentYear)} className="text-xs">{currentYear}</SelectItem>
                <SelectItem value={String(currentYear + 1)} className="text-xs">{currentYear + 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto pt-1 sm:pt-0 border-t border-border/40 sm:border-t-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(holidays.map((h) => h.id))}
              className="h-8 px-2.5 text-xs font-semibold text-primary hover:bg-primary-soft/40 cursor-pointer min-h-[36px] rounded-lg"
            >
              {t("selectAll")}
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer min-h-[36px] rounded-lg"
            >
              {t("deselectAll")}
            </Button>
          </div>
        </div>

        <div className="p-1 space-y-1 overflow-y-auto max-h-60">
          {holidays.map((h) => (
            <HolidaysListItem
              key={h.id}
              holiday={h}
              isSelected={selectedIds.includes(h.id)}
              onToggle={toggleHoliday}
            />
          ))}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 text-xs font-bold">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold text-center sm:text-left">
            {selectedIds.length} / {holidays.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={isPending || selectedIds.length === 0}
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" aria-hidden="true" />}
              <span>{t("importHolidaysConfirm")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
