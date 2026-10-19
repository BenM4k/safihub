"use client";

import { CheckCircle2, PhoneCall } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import { getSupportWhatsAppUrl } from "@/lib/support-config";
import { Button } from "@/components/ui/button";

interface TicketSuccessViewProps {
  ticketRef: string;
  reference: string;
  amount: number;
  onClose: () => void;
}

export function TicketSuccessView({
  ticketRef,
  reference,
  amount,
  onClose,
}: TicketSuccessViewProps) {
  const waLink = getSupportWhatsAppUrl(
    `Bonjour Support SafiHub, je souhaite signaler une anomalie sur la référence ${reference} (${formatMoney(amount, "CDF")}). Réf ticket : ${ticketRef}`
  );

  return (
    <div className="p-6 text-center space-y-4">
      <div className="size-12 rounded-full bg-success-light text-success-base border border-success-base/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="size-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-heading">
          Signalement transmis avec succès
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Votre réclamation a été transmise au service financier SafiHub. Un chargé de compte examine votre dossier.
        </p>
      </div>

      <div className="p-3 bg-surface rounded-xl border border-border inline-block text-xs font-mono font-bold text-heading">
        Numéro de ticket : <span className="text-primary">{ticketRef}</span>
      </div>

      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition min-h-[44px]"
        >
          <PhoneCall className="size-4" />
          <span>Suivre sur WhatsApp</span>
        </a>

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] text-xs font-semibold"
        >
          Fermer
        </Button>
      </div>
    </div>
  );
}
