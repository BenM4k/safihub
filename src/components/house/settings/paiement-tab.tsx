"use client";
 
import { Separator } from "@/components/ui/separator";
import { FinancialTermsCard } from "./paiement/financial-terms-card";
import { PayoutMethodCard } from "./paiement/payout-method-card";
import type { HouseRecord } from "@/dal";

interface PaiementTabProps {
  house: HouseRecord;
  nextPayoutDate?: string;
}

export function PaiementTab({ house, nextPayoutDate }: PaiementTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Modalités financières (Read-Only) */}
      <FinancialTermsCard house={house} nextPayoutDate={nextPayoutDate} />

      <Separator />

      {/* 2. Moyen de réception des fonds (Read-Only avec support path) */}
      <PayoutMethodCard house={house} />
    </div>
  );
}
