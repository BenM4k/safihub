import { Headphones, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { maskPhoneNumber } from "@/lib/phone-utils";
import type { HouseRecord } from "@/dal";

interface PayoutMethodCardProps {
  house: HouseRecord;
}

export function PayoutMethodCard({ house }: PayoutMethodCardProps) {
  const isConfigured = Boolean(house.contactPhone && house.contactPhone.trim().length > 5);
  const maskedPhone = maskPhoneNumber(house.contactPhone);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Moyen de réception des fonds</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Compte Mobile Money ou bancaire où sont transférés vos gains nets.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="min-h-[40px] text-xs font-semibold self-start sm:self-auto gap-1.5 rounded-lg cursor-pointer"
        >
          <a
            href="https://wa.me/243999999999"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Headphones className="size-3.5 text-primary" />
            <span>Contacter le support</span>
          </a>
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground text-sm">
            {isConfigured ? "Mobile Money" : "Non configuré"}
          </span>
          {isConfigured ? (
            <Badge variant="outline" className="text-[10px] font-bold text-success border-success/30 bg-success-soft/30 gap-1 rounded-full">
              <ShieldCheck className="size-3" />
              <span>Vérifié</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-bold rounded-full">
              Non configuré
            </Badge>
          )}
        </div>
        {isConfigured ? (
          <>
            <p className="font-mono text-muted-foreground">{maskedPhone}</p>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">Titulaire : {house.name}</p>
          </>
        ) : (
          <p className="text-slate-600 dark:text-slate-300 text-xs">
            Aucun compte de versement n&apos;est enregistré. Les versements sont retenus en toute sécurité.
          </p>
        )}
      </div>

      <p className="text-[11px] text-slate-600 dark:text-slate-300">
        Pour des raisons de sécurité financière, la modification du compte de versement nécessite une vérification par l&apos;assistance SafiHub.
      </p>
    </section>
  );
}
