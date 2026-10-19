"use client";

import { Button } from "@/components/ui/button";

interface PayoutMethodCardProps {
  provider: string;
  accountNumber: string;
  accountHolder: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChangeProvider: (val: string) => void;
  onChangeAccountNumber: (val: string) => void;
  onChangeAccountHolder: (val: string) => void;
  onRequestSave: () => void;
}

export function PayoutMethodCard({
  provider,
  accountNumber,
  accountHolder,
  isEditing,
  onToggleEdit,
  onChangeProvider,
  onChangeAccountNumber,
  onChangeAccountHolder,
  onRequestSave,
}: PayoutMethodCardProps) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-heading">Moyen de réception des fonds</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compte Mobile Money ou bancaire où sont transférés vos gains nets.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleEdit}
          className="text-xs font-semibold min-h-[40px] px-3"
        >
          {isEditing ? "Annuler la modification" : "Modifier les coordonnées"}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-4 text-xs max-w-md pt-2">
          <div>
            <label className="font-semibold text-foreground block mb-1.5">
              Opérateur / Fournisseur
            </label>
            <select
              value={provider}
              onChange={(e) => onChangeProvider(e.target.value)}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Airtel Money">Airtel Money</option>
              <option value="M-Pesa">Vodacom M-Pesa</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Banque">Virement bancaire (Rawbank / TMB)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1.5">
              Numéro de téléphone Mobile Money ou Compte
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => onChangeAccountNumber(e.target.value)}
              placeholder="+243 99..."
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1.5">
              Nom officiel du titulaire
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => onChangeAccountHolder(e.target.value)}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <Button
            type="button"
            onClick={onRequestSave}
            className="min-h-[44px] px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs"
          >
            Enregistrer avec confirmation sécurisée
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-surface rounded-xl border border-border text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-heading text-sm">{provider}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/30">
              Vérifié
            </span>
          </div>
          <p className="font-mono text-muted-foreground">{accountNumber}</p>
          <p className="text-muted-foreground text-[11px]">Titulaire : {accountHolder}</p>
        </div>
      )}
    </section>
  );
}
