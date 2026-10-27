"use client";

import { formatAmount } from "@/lib/order-formatters";
import { Input } from "@/components/ui/input";

interface MinimumOrderSectionProps {
  minimumOrderAmount: number;
  onChangeAmount: (val: number) => void;
}

export function MinimumOrderSection({
  minimumOrderAmount,
  onChangeAmount,
}: MinimumOrderSectionProps) {
  function handleRawChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cleanDigits = e.target.value.replace(/\D/g, "");
    const parsed = cleanDigits ? parseInt(cleanDigits, 10) : 0;
    onChangeAmount(Math.min(500000, Math.max(0, parsed)));
  }

  const formattedDisplay = minimumOrderAmount.toLocaleString("fr-FR");

  return (
    <section className="py-2 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-foreground">Montant minimum de commande</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Seuil en dessous duquel le client ne peut pas valider son panier auprès de votre pressing.
        </p>
      </div>

      <div className="flex items-center gap-2 max-w-xs">
        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="numeric"
            value={formattedDisplay}
            onChange={handleRawChange}
            className="pl-3 pr-14 text-base sm:text-xs font-bold font-mono h-10 sm:h-9 rounded-xl"
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
