"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import type { PartnerSettlementAlertsData } from "@/types/partner-settlements";
import { Button } from "@/components/ui/button";

interface SettlementAlertsProps {
  alerts: PartnerSettlementAlertsData;
  houseSlug: string;
}

export function SettlementAlerts({ alerts, houseSlug }: SettlementAlertsProps) {
  const { missingPayoutMethod, failedPayoutCount, failedPayoutNote, overdueOrdersCount, oldestUnsettledDays } =
    alerts;

  const hasAnyAlert = missingPayoutMethod || failedPayoutCount > 0 || overdueOrdersCount > 0;
  if (!hasAnyAlert) return null;

  return (
    <div className="space-y-3 font-sans" role="region" aria-label="Alertes de règlements">
      {/* 1. Missing payout method */}
      {missingPayoutMethod && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <h4 className="font-bold text-xs sm:text-sm font-display tracking-tight text-amber-950 dark:text-amber-100">
                Aucun compte de versement configuré
              </h4>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed text-xs">
                Ajoutez votre numéro Mobile Money (M-Pesa, Airtel Money, Orange Money) dans vos paramètres pour recevoir automatiquement vos versements chaque lundi.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white gap-1 min-h-[38px] rounded-lg text-xs font-semibold">
              <Link href={`/partner/${houseSlug}/settings`}>
                <span>Paramètres</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* 2. Failed / reversed payout */}
      {failedPayoutCount > 0 && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm font-display tracking-tight">
              Anomalie sur un précédent versement ({failedPayoutCount})
            </h4>
            <p className="mt-0.5 leading-relaxed text-xs">
              Un versement récent a fait l&apos;objet d&apos;une annulation ou d&apos;une révision par l&apos;équipe SafiHub : {failedPayoutNote || "Vérification comptable en cours"}. Le montant a été réintégré à votre solde à recevoir.
            </p>
          </div>
        </div>
      )}

      {/* 3. Overdue unsettled orders */}
      {overdueOrdersCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm font-display tracking-tight text-amber-950 dark:text-amber-100">
              Commandes livrées en attente de règlement ({overdueOrdersCount})
            </h4>
            <p className="mt-0.5 leading-relaxed text-xs text-amber-800 dark:text-amber-300">
              Certaines commandes livrées depuis plus de 7 jours {oldestUnsettledDays ? `(la plus ancienne il y a ${oldestUnsettledDays} jours)` : ""} sont toujours en attente de virement. Elles seront incluses dans la prochaine vague de versements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
