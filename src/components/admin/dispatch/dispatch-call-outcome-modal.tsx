"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, PhoneCall, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  if (!isOpen) return null;

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
      setSelectedOutcome(null);
      setNote("");
      if (onSuccess) onSuccess();
      onClose();
    }
  }

  const outcomes: Array<{
    id: FollowUpOutcome;
    label: string;
    icon: React.ReactNode;
    colorClasses: string;
  }> = [
    {
      id: "no_answer",
      label: t("outcomeNoAnswer"),
      icon: <PhoneCall className="w-4 h-4 text-ink-400" />,
      colorClasses: "border-border-strong hover:border-heading text-foreground bg-card",
    },
    {
      id: "will_accept",
      label: t("outcomeWillAccept"),
      icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      colorClasses: "border-success/30 hover:border-success text-success bg-success-soft",
    },
    {
      id: "refused",
      label: t("outcomeRefused"),
      icon: <XCircle className="w-4 h-4 text-destructive" />,
      colorClasses: "border-destructive/30 hover:border-destructive text-destructive bg-destructive-soft",
    },
    {
      id: "call_back_later",
      label: t("outcomeCallBackLater"),
      icon: <Clock className="w-4 h-4 text-warning" />,
      colorClasses: "border-warning/30 hover:border-warning text-warning bg-warning-soft",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="outcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in font-sans"
    >
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border bg-surface">
          <h3 id="outcome-modal-title" className="text-base font-bold text-heading font-display">
            Résultat de la relance
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {pressingName} • {orderIds.length} commande(s) concernée(s)
          </p>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive-soft border border-destructive/20 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Statut de la relance
            </label>
            <div className="grid grid-cols-2 gap-2">
              {outcomes.map((item) => {
                const isSelected = selectedOutcome === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedOutcome(item.id);
                    }}
                    className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer ${
                      item.colorClasses
                    } ${
                      isSelected
                        ? "ring-2 ring-primary border-primary bg-primary-soft text-primary-soft-foreground"
                        : ""
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="relance-note"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1"
            >
              Note optionnelle
            </label>
            <textarea
              id="relance-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Demande de rappeler à 14h30, responsable absent..."
              className="w-full text-xs p-3 rounded-lg border border-border-strong bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-heading placeholder:text-ink-400"
            />
          </div>
        </div>

        <div className="p-4 bg-surface border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs min-h-[40px] px-4 border-border-strong hover:bg-muted text-foreground font-display"
          >
            Fermer
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || !selectedOutcome}
            onClick={() => handleSubmit()}
            className="text-xs min-h-[40px] px-5 bg-primary text-primary-foreground hover:bg-primary-hover font-display"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer le suivi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
