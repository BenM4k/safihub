"use client";

import { formatAmount } from "@/lib/order-formatters";

interface MinimumOrderSectionProps {
  minimumOrderAmount: number;
  onChangeAmount: (val: number) => void;
}

export function MinimumOrderSection({
  minimumOrderAmount,
  onChangeAmount,
}: MinimumOrderSectionProps) {
  function handleRawChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip non-digits
    const cleanDigits = e.target.value.replace(/\D/g, "");
    const parsed = cleanDigits ? parseInt(cleanDigits, 10) : 0;
    // Bound within [0, 500000]
    onChangeAmount(Math.min(500000, Math.max(0, parsed)));
  }

  // Format with thousand space separator
  const formattedDisplay = minimumOrderAmount.toLocaleString("fr-FR");

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div>
        <h2 className="text-sm font-bold text-heading">Montant minimum de commande</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Seuil en dessous duquel le client ne peut pas valider son panier auprès de votre pressing.
        </p>
      </div>

      <div className="flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={formattedDisplay}
            onChange={handleRawChange}
            className="w-full h-10 min-h-[44px] pl-3 pr-14 rounded-xl border border-border text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Montant minimum en francs congolais"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
            CDF
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Actuellement configuré à {formatAmount(minimumOrderAmount)}. Défaut recommandé plateforme : 5 000 CDF (max 500 000 CDF).
      </p>
    </section>
  );
}
