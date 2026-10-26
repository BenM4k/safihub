"use client";

import Link from "next/link";
import { Landmark, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AdminHouseRow } from "../types";

interface HouseTabSettlementsProps {
  house: AdminHouseRow;
}

export function HouseTabSettlements({ house }: HouseTabSettlementsProps) {
  const isSettled = house.balanceOwedCDF === 0;

  return (
    <div className="space-y-5 text-xs">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Landmark className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Solde restant dû</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
              isSettled
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
            )}
          >
            {isSettled ? (
              <>
                <CheckCircle2 className="size-3" />
                <span>À jour</span>
              </>
            ) : (
              <>
                <Clock className="size-3" />
                <span>À régler</span>
              </>
            )}
          </span>
        </div>

        <div>
          <MoneyCell
            amount={house.balanceOwedCDF}
            className="text-2xl font-bold text-foreground text-left"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            {isSettled
              ? "Tous les règlements pour les commandes livrées ont été soldés."
              : "Ce montant correspond aux commandes livrées nettes de commission plateforme, en attente de versement."}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <Link
          href="/admin/settlements#pressings-section"
          className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between font-semibold text-foreground"
        >
          <div className="flex items-center gap-2.5">
            <Landmark className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ouvrir la console Règlements & Paiements</span>
          </div>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
