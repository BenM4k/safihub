"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, PhoneCall, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { logPressingRelanceAction } from "@/actions/admin-dispatch.actions";
import type { FollowUpOutcome } from "@/lib/dispatch-grouping";

interface DispatchCallOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pressingId: string;
  pressingName: string;
  orderIds: string[];
  channel?: "call" | "whatsapp";
  onSuccess?: () => void;
}

export function DispatchCallOutcomeModal({
  isOpen,
  onClose,
  pressingId,
  pressingName,
  orderIds,
  channel = "call",
  onSuccess,
}: DispatchCallOutcomeModalProps) {
  const t = useTranslations("admin.dispatch");
  const [selectedOutcome, setSelectedOutcome] = useState<FollowUpOutcome | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setSelectedOutcome(null);
    setNote("");
    setError(null);
    onClose();
  }

  async function handleSubmit(outcomeToSave?: FollowUpOutcome) {
    const outcome = outcomeToSave || selectedOutcome || "pending";
    setIsSubmitting(true);
    setError(null);

    const res = await logPressingRelanceAction({
      pressingId,
      orderIds,
      channel,
      outcome,
      note: note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      handleClose();
      if (onSuccess) onSuccess();
    }
  }

  const outcomes: Array<{
    id: FollowUpOutcome;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      id: "no_answer",
      label: t("outcomeNoAnswer"),
      icon: <PhoneCall className="size-3.5" />,
      activeClass: "bg-muted text-foreground border-border",
    },
    {
      id: "will_accept",
      label: t("outcomeWillAccept"),
      icon: <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
      activeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      id: "refused",
      label: t("outcomeRefused"),
      icon: <XCircle className="size-3.5 text-destructive" />,
      activeClass: "bg-destructive/10 text-destructive border-destructive/30",
    },
    {
      id: "call_back_later",
      label: t("outcomeCallBackLater"),
      icon: <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />,
      activeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-base font-bold text-foreground font-display">
            Résultat de la relance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {pressingName} · {orderIds.length} commande(s) concernée(s)
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Statut de la relance
            </FieldLabel>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {outcomes.map((item) => {
                const isSelected = selectedOutcome === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedOutcome(item.id)}
                    className={`flex items-center gap-2 p-2.5 text-xs font-semibold rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? item.activeClass
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="relance-note"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
            >
              Note optionnelle
            </FieldLabel>
            <Textarea
              id="relance-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Le gérant promet d'accepter d'ici 10 minutes..."
              className="mt-1 text-xs resize-none"
            />
          </Field>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs"
          >
            Fermer sans enregistrer
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!selectedOutcome || isSubmitting}
            className="text-xs"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
