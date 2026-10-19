"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, FileText, Receipt, X } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import type { PartnerPayoutDTO } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";

interface PayoutDetailSheetProps {
  payout: PartnerPayoutDTO | null;
  onClose: () => void;
  houseSlug: string;
  onOpenReportDialog: (payout: PartnerPayoutDTO) => void;
  onOpenReceiptModal: (payout: PartnerPayoutDTO) => void;
}

export function PayoutDetailSheet({
  payout,
  onClose,
  houseSlug,
  onOpenReportDialog,
  onOpenReceiptModal,
}: PayoutDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!payout) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [payout, onClose]);

  if (!payout) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payout-sheet-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-success-light text-success-base border border-success-base/30 flex items-center justify-center shrink-0">
              <Receipt className="size-5" />
            </div>
            <div>
              <h2 id="payout-sheet-title" className="text-sm font-bold text-heading">
                Détail du versement
              </h2>
              <span className="text-2xs text-muted-foreground font-mono">
                {payout.reference || `#${payout.id.slice(0, 8)}`}
              </span>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-surface-hover transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fermer le volet"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main summary card */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Montant versé</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-light text-success-base text-2xs font-semibold border border-success-base/30">
                <CheckCircle2 className="size-3" />
                Payé
              </span>
            </div>

            <div className="text-3xl font-black font-mono text-success-base tabular-nums">
              +{formatMoney(payout.amount, "CDF")}
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block text-2xs text-muted-foreground/80">Date :</span>
                <span className="font-mono text-heading font-medium">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(payout.date))}
                </span>
              </div>
              <div>
                <span className="block text-2xs text-muted-foreground/80">Mode de paiement :</span>
                <span className="text-heading font-medium capitalize">
                  {payout.method.replace("_", " ")}
                </span>
              </div>
            </div>

            {payout.periodCovered && (
              <div className="pt-2 border-t border-border text-xs">
                <span className="text-2xs text-muted-foreground/80 block">Période concernée :</span>
                <span className="font-medium text-heading">{payout.periodCovered}</span>
              </div>
            )}
          </div>

          {/* Included Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-heading uppercase tracking-wider">
                Commandes incluses ({payout.ordersCount})
              </h3>
              <span className="text-2xs text-muted-foreground">
                Total net affecté
              </span>
            </div>

            {payout.includedOrders.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Aucune commande détaillée directement rattachée à ce versement.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-surface">
                {payout.includedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover transition"
                  >
                    <div>
                      <Link
                        href={`/partner/${houseSlug}/orders?search=${ord.code}`}
                        className="font-mono font-bold text-heading hover:text-primary transition flex items-center gap-1"
                      >
                        <span>{ord.shortReference}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                      <span className="text-2xs text-muted-foreground block">
                        Client : {ord.customerDisplayName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-heading tabular-nums block">
                        {formatMoney(ord.netAmount, "CDF")}
                      </span>
                      <span className="text-2xs text-success-base font-semibold">
                        Inclus dans ce virement
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenReceiptModal(payout)}
            className="flex-1 min-h-[44px] text-xs font-semibold gap-1.5"
          >
            <FileText className="size-3.5" />
            <span>Voir reçu officiel</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenReportDialog(payout)}
            className="text-destructive-base hover:bg-destructive-light hover:text-destructive-base min-h-[44px] text-xs font-semibold"
          >
            Signaler un problème
          </Button>
        </div>
      </div>
    </div>
  );
}
