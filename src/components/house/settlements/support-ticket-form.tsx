"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, PhoneCall, Send, X } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import { getSupportWhatsAppUrl } from "@/lib/support-config";
import { reportPartnerSettlementIssueAction } from "@/actions/partner-settlement.actions";
import { Button } from "@/components/ui/button";
import { TicketSuccessView } from "./ticket-success-view";

export interface SupportTicketTarget {
  type: "order" | "settlement";
  reference: string;
  amount: number;
  periodOrDate?: string | null;
  orderId?: string;
  settlementId?: string;
}

interface SupportTicketFormProps {
  target: SupportTicketTarget;
  onClose: () => void;
  houseSlug: string;
}

const CATEGORIES = [
  "Montant net incorrect",
  "Taux de commission contesté",
  "Versement non reçu ou incomplet",
  "Erreur d'affectation de commande",
  "Autre réclamation financière",
];

export function SupportTicketForm({
  target,
  onClose,
  houseSlug,
}: SupportTicketFormProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTicketRef, setCreatedTicketRef] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg("Veuillez détailler votre réclamation (au moins 5 caractères).");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await reportPartnerSettlementIssueAction({
        houseSlug,
        reference: target.reference,
        targetType: target.type,
        orderId: target.orderId,
        settlementId: target.settlementId,
        reasonCategory: category,
        message: message.trim(),
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setCreatedTicketRef(res.value.ticketReference);
      }
    });
  }

  const waLink = getSupportWhatsAppUrl(
    `Bonjour Support SafiHub, je souhaite signaler une anomalie sur la référence ${target.reference} (${formatMoney(target.amount, "CDF")}).`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-destructive-light text-destructive-base border border-destructive-base/30 flex items-center justify-center shrink-0">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h2 id="ticket-dialog-title" className="text-sm font-bold text-heading">
                Signaler un problème financier
              </h2>
              <span className="text-2xs text-muted-foreground font-mono">
                Réf : {target.reference}
              </span>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 text-muted-foreground hover:text-heading rounded-lg hover:bg-surface-hover transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {createdTicketRef ? (
          <TicketSuccessView
            ticketRef={createdTicketRef}
            reference={target.reference}
            amount={target.amount}
            onClose={onClose}
          />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Pre-filled info card */}
            <div className="p-3.5 rounded-xl bg-surface border border-border grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-2xs text-muted-foreground block">Élément concerné :</span>
                <span className="font-semibold text-heading">
                  {target.type === "order" ? "Commande" : "Versement"} {target.reference}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xs text-muted-foreground block">Montant :</span>
                <span className="font-mono font-bold text-primary">
                  {formatMoney(target.amount, "CDF")}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive-base font-medium">
                {errorMsg}
              </div>
            )}

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-heading block">
                Motif du signalement
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:ring-2 focus:ring-primary focus:outline-hidden min-h-[44px]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Message description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-heading block">
                Explication détaillée <span className="text-destructive-base">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                placeholder="Décrivez l'écart constaté, le calcul attendu ou les détails du problème..."
                className="w-full p-3 rounded-xl border border-border bg-surface text-xs focus:ring-2 focus:ring-primary focus:outline-hidden resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 min-h-[44px]"
              >
                <PhoneCall className="size-3.5" />
                <span>Support WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isPending}
                  className="min-h-[44px] px-3.5 text-xs font-semibold"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || message.trim().length < 5}
                  className="min-h-[44px] px-4 text-xs font-semibold bg-primary hover:bg-primary-hover text-white gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>{isPending ? "Transmission..." : "Envoyer"}</span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
