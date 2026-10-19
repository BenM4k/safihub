"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import type { PartnerSettlementAlertsData } from "@/types/partner-settlements";

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
    <div className="space-y-3" role="region" aria-label="Alertes de règlements">
      {/* 1. Missing payout method */}
      {missingPayoutMethod && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-xs sm:text-sm">
                Aucun compte de versement configuré
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                Ajoutez votre numéro Mobile Money (M-Pesa, Airtel Money, Orange Money) dans vos paramètres pour recevoir automatiquement vos versements chaque lundi.
              </p>
            </div>
          </div>

          <Link
            href={`/partner/${houseSlug}/settings`}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 transition min-h-[44px] sm:min-h-0 items-center justify-center"
          >
            <span>Paramètres</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* 2. Failed / reversed payout */}
      {failedPayoutCount > 0 && (
        <div className="p-4 rounded-xl bg-destructive-light border border-destructive-base/30 text-destructive-base flex items-start gap-2.5 text-xs">
          <ShieldAlert className="size-4.5 text-destructive-base shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-xs sm:text-sm">
              Anomalie sur un précédent versement ({failedPayoutCount})
            </p>
            <p className="mt-0.5 text-destructive-base/90 leading-relaxed">
              Un versement récent a fait l&apos;objet d&apos;une annulation ou d&apos;une révision par l&apos;équipe SafiHub : {failedPayoutNote || "Vérification comptable en cours"}. Le montant a été réintégré à votre solde à recevoir.
            </p>
          </div>
        </div>
      )}

      {/* 3. Overdue unsettled orders (> N days) */}
      {overdueOrdersCount > 0 && (
        <div className="p-4 rounded-xl bg-warning-light border border-warning-base/30 text-warning-base flex items-start gap-2.5 text-xs">
          <AlertTriangle className="size-4.5 text-warning-base shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-bold text-xs sm:text-sm">
              Commandes livrées en attente de règlement ({overdueOrdersCount})
            </p>
            <p className="mt-0.5 leading-relaxed">
              Certaines commandes livrées depuis plus de 7 jours {oldestUnsettledDays ? `(la plus ancienne il y a ${oldestUnsettledDays} jours)` : ""} sont toujours en attente de virement. Elles seront incluses dans la prochaine vague de versements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
