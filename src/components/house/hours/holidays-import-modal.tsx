"use client";

import { useState, useMemo } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Calendar className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-heading font-display">
                {t("importHolidaysTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("importHolidaysDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-heading">{t("yearLabel")}</span>
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => {
                const yr = Number(val);
                setSelectedYear(yr);
                setSelectedIds(getDrcHolidaysForYear(yr).filter((h) => !h.isPast).map((h) => h.id));
              }}
            >
              <SelectTrigger className="h-7 w-24 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(currentYear)} className="text-xs">{currentYear}</SelectItem>
                <SelectItem value={String(currentYear + 1)} className="text-xs">{currentYear + 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(holidays.map((h) => h.id))}
              className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary-soft/40"
            >
              {t("selectAll")}
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("deselectAll")}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto">
          {holidays.map((h) => (
            <HolidaysListItem
              key={h.id}
              holiday={h}
              isSelected={selectedIds.includes(h.id)}
              onToggle={toggleHoliday}
            />
          ))}

          {errorMsg && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-muted-foreground font-semibold">
            {selectedIds.length} / {holidays.length}
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose} className="h-9 text-xs font-semibold">
              {t("cancel")}
            </Button>
            <Button type="button" disabled={isPending || selectedIds.length === 0} onClick={handleConfirm} className="h-9 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs">
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" aria-hidden="true" />}
              <span>{t("importHolidaysConfirm")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
