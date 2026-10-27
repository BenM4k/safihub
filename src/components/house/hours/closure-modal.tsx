"use client";

import { useState } from "react";
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Calendar className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-heading font-display">
                {isEditing ? t("editClosure") : t("addClosure")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? t("closuresSubtitle") : t("closuresSubtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
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
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
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
