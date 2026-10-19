import { Headphones, ShieldCheck } from "lucide-react";
import { maskPhoneNumber } from "@/lib/phone-utils";
import type { HouseRecord } from "@/dal";

interface PayoutMethodCardProps {
  house: HouseRecord;
}

export function PayoutMethodCard({ house }: PayoutMethodCardProps) {
  const isConfigured = Boolean(house.contactPhone && house.contactPhone.trim().length > 5);
  const maskedPhone = maskPhoneNumber(house.contactPhone);

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-heading">Moyen de réception des fonds</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compte Mobile Money ou bancaire où sont transférés vos gains nets.
          </p>
        </div>

        <a
          href="https://wa.me/243999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 min-h-[40px] border border-border self-start sm:self-auto"
        >
          <Headphones className="size-3.5 text-primary" />
          <span>Contacter le support</span>
        </a>
      </div>

      <div className="p-4 bg-surface rounded-xl border border-border text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-heading text-sm">
            {isConfigured ? "Mobile Money" : "Non configuré"}
          </span>
          {isConfigured ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/30 flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>Vérifié</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
              Non configuré
            </span>
          )}
        </div>
        {isConfigured ? (
          <>
            <p className="font-mono text-muted-foreground">{maskedPhone}</p>
            <p className="text-muted-foreground text-[11px]">Titulaire : {house.name}</p>
          </>
        ) : (
          <p className="text-muted-foreground text-xs">
            Aucun compte de versement n&apos;est enregistré. Les versements sont retenus en toute sécurité.
          </p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Pour des raisons de sécurité financière, la modification du compte de versement nécessite une vérification par l&apos;assistance SafiHub.
      </p>
    </section>
  );
}
