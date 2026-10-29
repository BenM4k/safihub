"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("house.settlements");
  const waLink = getSupportWhatsAppUrl(
    `Bonjour Support SafiHub, je souhaite signaler une anomalie sur la référence ${reference} (${formatMoney(amount, "CDF")}). Réf ticket : ${ticketRef}`
  );

  return (
    <div className="p-6 text-center space-y-4 font-sans">
      <div className="size-12 rounded-full bg-success-soft text-success border border-success/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="size-6 text-success" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-heading font-display">
          {t("ticketSuccessTitle")}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {t("ticketSuccessDesc")}
        </p>
      </div>

      <div className="p-3 bg-muted/40 rounded-xl border border-border/60 inline-block text-xs font-mono font-bold text-heading">
        {t("ticketNumber", { ref: ticketRef })}
      </div>

      <div className="pt-3 flex flex-row items-center justify-center gap-2.5">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial px-4 h-10 sm:h-9 rounded-lg bg-success hover:bg-success/90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
        >
          <PhoneCall className="size-3.5" />
          <span>{t("ticketTrackWhatsApp")}</span>
        </a>

        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 sm:flex-initial h-10 sm:h-9 text-xs font-semibold rounded-lg"
        >
          {t("ticketClose")}
        </Button>
      </div>
    </div>
  );
}
