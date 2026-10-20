"use client";

import { useState, useRef } from "react";
import { AlertCircle, AlertTriangle, Calendar, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";
import { toBukavuDateTime } from "@/services/availability";
import {
  checkClosureOverlap,
  formatDateFr,
  type ClosureItem,
} from "@/lib/hours-utils";

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  closureToEdit?: ClosureItem | null;
  existingClosures: ClosureItem[];
  waitingOrdersCount?: number;
  onSave: (data: { startsOn: string; endsOn: string; reason?: string }) => Promise<{ ok: boolean; error?: string }>;
}

const REASON_PRESETS = [
  "Jour férié",
  "Inventaire",
  "Travaux de maintenance",
  "Congés annuels",
  "Autre",
] as const;

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
  waitingOrdersCount,
  onSave,
}: ClosureModalProps) {
  const t = useTranslations("house.hours");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef: closeButtonRef,
    trapTab: true,
  });

  const todayIso = toBukavuDateTime(new Date()).dateString;
  const [startsOn, setStartsOn] = useState(() => closureToEdit?.startsOn ?? todayIso);
  const [endsOn, setEndsOn] = useState(() => closureToEdit?.endsOn ?? todayIso);
  const [reason, setReason] = useState(() => closureToEdit?.reason ?? "");
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync endsOn with startsOn if endsOn is before startsOn
  function handleStartsOnChange(val: string) {
    setStartsOn(val);
    if (!endsOn || endsOn < val) {
      setEndsOn(val);
    }
  }

  // Detect overlap
  const overlappingClosure = checkClosureOverlap(
    startsOn,
    endsOn,
    existingClosures,
    closureToEdit?.id
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startsOn || !endsOn) {
      setErrorMsg("Veuillez renseigner les dates de début et de fin.");
      return;
    }
    if (endsOn < startsOn) {
      setErrorMsg("La date de fin doit être égale ou postérieure à la date de début.");
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
      setErrorMsg(res.error || "Une erreur est survenue lors de l'enregistrement.");
    } else {
      onClose();
    }
  }

  const isEditing = Boolean(closureToEdit);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="closure-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-lift flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <Calendar className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="closure-modal-title" className="text-base sm:text-lg font-bold text-heading font-display">
                {isEditing ? t("editClosure") : t("addClosure")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Modifiez les dates ou le motif de cette fermeture."
                  : "Programmez une fermeture temporaire ou un jour férié."}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="closure-starts-on" className="text-xs font-semibold text-foreground">
                {t("startsOn")}
              </Label>
              <Input
                id="closure-starts-on"
                type="date"
                required
                min={isEditing ? undefined : todayIso}
                value={startsOn}
                onChange={(e) => handleStartsOnChange(e.target.value)}
                className="h-11 sm:h-9 text-xs"
              />
              <span className="text-[11px] text-muted-foreground block">
                Format : {formatDateFr(startsOn) || "jj/mm/aaaa"}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="closure-ends-on" className="text-xs font-semibold text-foreground">
                {t("endsOn")}
              </Label>
              <Input
                id="closure-ends-on"
                type="date"
                required
                min={startsOn || todayIso}
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className="h-11 sm:h-9 text-xs"
              />
              <span className="text-[11px] text-muted-foreground block">
                Format : {formatDateFr(endsOn) || "jj/mm/aaaa"}
              </span>
            </div>
          </div>

          {/* Reason Presets */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground block">
              Suggestions de motifs
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset === "Autre" ? "" : preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    reason === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface hover:bg-card text-foreground border-border"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Text */}
          <div className="space-y-1.5">
            <Label htmlFor="closure-reason-input" className="text-xs font-semibold text-foreground">
              {t("reason")}
            </Label>
            <Input
              id="closure-reason-input"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              maxLength={100}
              className="h-11 sm:h-9 text-xs"
            />
          </div>

          {/* Overlap Warning */}
          {overlappingClosure && (
            <div className="p-3 bg-warning-soft text-warning rounded-xl border border-warning/30 text-xs flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">Attention : chevauchement détecté</p>
                <p className="mt-0.5">
                  Cette période chevauche la fermeture existante du {formatDateFr(overlappingClosure.startsOn)} au {formatDateFr(overlappingClosure.endsOn)}
                  {overlappingClosure.reason ? ` (${overlappingClosure.reason})` : ""}.
                </p>
              </div>
            </div>
          )}

          {/* Open Orders Warning */}
          {(waitingOrdersCount ?? 0) > 0 && (
            <div className="p-3 bg-surface text-foreground rounded-xl border border-border text-xs flex items-start gap-2">
              <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold text-heading">
                  {waitingOrdersCount} commande{waitingOrdersCount! > 1 ? "s" : ""} en attente d&apos;acceptation.
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Leur délai d&apos;acceptation déjà en cours reste valide selon la règle initiale.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <p role="alert" className="text-xs text-destructive font-semibold">
              {errorMsg}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
              type="submit"
              disabled={isPending}
              className="h-10 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" aria-hidden="true" />}
              <span>{isEditing ? "Enregistrer les modifications" : "Ajouter la fermeture"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
