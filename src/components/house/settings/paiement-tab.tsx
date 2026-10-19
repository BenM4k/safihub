"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { FinancialTermsCard } from "./paiement/financial-terms-card";
import { PayoutMethodCard } from "./paiement/payout-method-card";
import { ReauthModal } from "./paiement/reauth-modal";
import type { HouseRecord } from "@/dal";

interface PaiementTabProps {
  house: HouseRecord;
}

export function PaiementTab({ house }: PaiementTabProps) {
  const [provider, setProvider] = useState("Airtel Money");
  const [accountNumber, setAccountNumber] = useState("+243 99 ••• ••42");
  const [accountHolder, setAccountHolder] = useState(house.name);
  const [isEditing, setIsEditing] = useState(false);
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  function handleConfirmReAuth() {
    setIsReAuthOpen(false);
    setIsEditing(false);
    setSaveSuccess(
      "Coordonnées de versement mises à jour. Un avis de sécurité et un enregistrement d'audit ont été générés."
    );
    setTimeout(() => setSaveSuccess(null), 4000);
  }

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="p-4 bg-success-soft border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 1. Modalités financières (Read-Only) */}
      <FinancialTermsCard house={house} />

      {/* 2. Moyen de réception des fonds */}
      <PayoutMethodCard
        provider={provider}
        accountNumber={accountNumber}
        accountHolder={accountHolder}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onChangeProvider={setProvider}
        onChangeAccountNumber={setAccountNumber}
        onChangeAccountHolder={setAccountHolder}
        onRequestSave={() => setIsReAuthOpen(true)}
      />

      {/* Re-Auth Confirmation Modal */}
      <ReauthModal
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={handleConfirmReAuth}
      />
    </div>
  );
}
