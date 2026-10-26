"use client";

import { useState, useTransition } from "react";
import { PhoneCall, Send } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import { getSupportWhatsAppUrl } from "@/lib/support-config";
import { reportPartnerSettlementIssueAction } from "@/actions/partner-settlement.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  onSuccess: (ticketRef: string) => void;
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
  onSuccess,
}: SupportTicketFormProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        onSuccess(res.value.ticketReference);
      }
    });
  }

  const waLink = getSupportWhatsAppUrl(
    `Bonjour Support SafiHub, je souhaite signaler une anomalie sur la référence ${target.reference} (${formatMoney(target.amount, "CDF")}).`
  );

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      {/* Pre-filled info strip */}
      <div className="p-3.5 rounded-xl bg-muted/40 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-2xs text-muted-foreground block">Élément concerné :</span>
          <span className="font-semibold text-foreground">
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
        <Alert variant="destructive">
          <AlertDescription className="text-xs font-medium">
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* Category selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground block">
          Motif du signalement
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-hidden min-h-[40px]"
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
        <label className="text-xs font-semibold text-foreground block">
          Explication détaillée <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          placeholder="Décrivez l'écart constaté, le calcul attendu ou les détails du problème..."
          className="resize-none text-xs"
        />
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border flex items-center justify-between gap-2.5">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 min-h-[40px]"
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
            className="min-h-[40px] px-3.5 text-xs font-semibold"
          >
            Annuler
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isPending || message.trim().length < 5}
            className="min-h-[40px] px-4 text-xs font-semibold gap-1.5"
          >
            <Send className="size-3.5" />
            <span>{isPending ? "Transmission..." : "Envoyer"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
