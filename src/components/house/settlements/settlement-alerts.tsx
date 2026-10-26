"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import type { PartnerSettlementAlertsData } from "@/types/partner-settlements";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <div className="space-y-3" role="region" aria-label="Alertes de règlements">
      {/* 1. Missing payout method */}
      {missingPayoutMethod && (
        <Alert variant="default" className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <AlertTitle className="font-bold text-xs sm:text-sm">
                Aucun compte de versement configuré
              </AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed text-xs">
                Ajoutez votre numéro Mobile Money (M-Pesa, Airtel Money, Orange Money) dans vos paramètres pour recevoir automatiquement vos versements chaque lundi.
              </AlertDescription>
            </div>
            <Button asChild size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white gap-1 min-h-[38px]">
              <Link href={`/partner/${houseSlug}/settings`}>
                <span>Paramètres</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </Alert>
      )}

      {/* 2. Failed / reversed payout */}
      {failedPayoutCount > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="font-bold text-xs sm:text-sm">
            Anomalie sur un précédent versement ({failedPayoutCount})
          </AlertTitle>
          <AlertDescription className="mt-0.5 leading-relaxed text-xs">
            Un versement récent a fait l&apos;objet d&apos;une annulation ou d&apos;une révision par l&apos;équipe SafiHub : {failedPayoutNote || "Vérification comptable en cours"}. Le montant a été réintégré à votre solde à recevoir.
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Overdue unsettled orders */}
      {overdueOrdersCount > 0 && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-bold text-xs sm:text-sm">
            Commandes livrées en attente de règlement ({overdueOrdersCount})
          </AlertTitle>
          <AlertDescription className="mt-0.5 leading-relaxed text-xs text-amber-800 dark:text-amber-300">
            Certaines commandes livrées depuis plus de 7 jours {oldestUnsettledDays ? `(la plus ancienne il y a ${oldestUnsettledDays} jours)` : ""} sont toujours en attente de virement. Elles seront incluses dans la prochaine vague de versements.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
