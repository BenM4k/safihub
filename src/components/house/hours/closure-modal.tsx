"use client";

import { useState } from "react";
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
import { toBukavuDateTime } from "@/services/availability";
import { checkClosureOverlap, type ClosureItem } from "@/lib/hours-utils";
import { ClosureFormFields } from "./closure-form-fields";

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  closureToEdit?: ClosureItem | null;
  existingClosures: ClosureItem[];
  waitingOrdersCount?: number;
  onSave: (data: { startsOn: string; endsOn: string; reason?: string }) => Promise<{ ok: boolean; error?: string }>;
}

export function ClosureModal({
  isOpen,
  onClose,
  closureToEdit,
  existingClosures,
  waitingOrdersCount = 0,
  onSave,
}: ClosureModalProps) {
  if (!isOpen) return null;

  return (
    <ClosureModalContent
      key={closureToEdit?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      closureToEdit={closureToEdit}
      existingClosures={existingClosures}
      waitingOrdersCount={waitingOrdersCount}
      onSave={onSave}
    />
  );
}

function ClosureModalContent({
  isOpen,
  onClose,
  closureToEdit,
  existingClosures,
  waitingOrdersCount = 0,
  onSave,
}: ClosureModalProps) {
  const t = useTranslations("house.hours");
  const todayIso = toBukavuDateTime(new Date()).dateString;
  const [startsOn, setStartsOn] = useState(() => closureToEdit?.startsOn ?? todayIso);
  const [endsOn, setEndsOn] = useState(() => closureToEdit?.endsOn ?? todayIso);
  const [reason, setReason] = useState(() => closureToEdit?.reason ?? "");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleStartsOnChange(val: string) {
    setStartsOn(val);
    if (!endsOn || endsOn < val) {
      setEndsOn(val);
    }
  }

  const overlappingClosure = checkClosureOverlap(
    startsOn,
    endsOn,
    existingClosures,
    closureToEdit?.id
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startsOn || !endsOn) {
      setErrorMsg(t("missingDatesError"));
      return;
    }
    if (endsOn < startsOn) {
      setErrorMsg(t("dateOrderError"));
      return;
    }

    setIsPending(true);
    setErrorMsg(null);

    const res = await onSave({
      startsOn,
      endsOn,
      reason: reason.trim() || undefined,
    });

    setIsPending(false);
    if (!res.ok) {
      setErrorMsg(res.error || t("saveError"));
    } else {
      onClose();
    }
  }

  const isEditing = Boolean(closureToEdit);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-card border border-border shadow-lift font-sans">
        <DialogHeader className="p-4 sm:p-5 pr-12 border-b border-border/60 bg-surface shrink-0 text-left space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Calendar className="size-5 text-primary shrink-0" aria-hidden="true" />
            <DialogTitle className="text-base sm:text-lg font-bold text-heading font-display tracking-tight">
              {isEditing ? t("editClosure") : t("addClosure")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("closuresSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto overflow-x-hidden flex-1 max-w-full p-4 sm:p-5 space-y-4">
          <ClosureFormFields
            startsOn={startsOn}
            endsOn={endsOn}
            reason={reason}
            todayIso={todayIso}
            isEditing={isEditing}
            overlappingClosure={overlappingClosure}
            waitingOrdersCount={waitingOrdersCount}
            onStartsOnChange={handleStartsOnChange}
            onEndsOnChange={setEndsOn}
            onReasonChange={setReason}
          />

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-destructive-soft/30 border border-destructive/20 text-destructive flex items-start gap-3 text-xs font-bold break-words"
            >
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <div className="min-w-0 flex-1">{errorMsg}</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border/60 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-9 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" aria-hidden="true" />}
              <span>{isEditing ? t("saveHours") : t("addClosure")}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
