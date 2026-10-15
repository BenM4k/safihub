"use client";

import Link from "next/link";
import { Landmark, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import type { AdminHouseRow } from "../types";

interface HouseTabSettlementsProps {
  house: AdminHouseRow;
}

export function HouseTabSettlements({ house }: HouseTabSettlementsProps) {
  const isSettled = house.balanceOwedCDF === 0;

  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl border-2 border-border-strong bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-heading flex items-center gap-1.5">
            <Landmark className="size-4 text-emerald-600" />
            <span>Solde restant dû</span>
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isSettled
                ? "bg-success-light text-success-base border-success-base/30"
                : "bg-warning-light text-warning-base border-warning-base/30"
            }`}
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

        <div className="pt-2">
          <MoneyCell
            amount={house.balanceOwedCDF}
            className="text-2xl font-black text-heading text-left"
          />
          <p className="text-[11px] text-ink-600 mt-1">
            {isSettled
              ? "Tous les règlements pour les commandes livrées ont été soldés."
              : "Ce montant correspond aux commandes livrées nettes de commission plateforme, en attente de versement."}
          </p>
        </div>
      </div>

      <div>
        <Link
          href="/admin/settlements#pressings-section"
          className="p-3.5 rounded-xl border-2 border-border-strong bg-card hover:bg-surface-hover transition-colors flex items-center justify-between font-bold text-heading"
        >
          <div className="flex items-center gap-2.5">
            <Landmark className="size-4 text-emerald-600" />
            <span>Ouvrir la console Règlements & Paiements</span>
          </div>
          <ArrowUpRight className="size-3.5 text-ink-400" />
        </Link>
      </div>
    </div>
  );
}
