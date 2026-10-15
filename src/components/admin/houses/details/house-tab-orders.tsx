"use client";

import Link from "next/link";
import { ShoppingBag, ArrowUpRight, Truck } from "lucide-react";
import type { AdminHouseRow } from "../types";

interface HouseTabOrdersProps {
  house: AdminHouseRow;
}

export function HouseTabOrders({ house }: HouseTabOrdersProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl border-2 border-border-strong bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-heading flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            <span>Commandes actives</span>
          </span>
          <span className="text-sm font-black px-2.5 py-1 rounded-full bg-primary-soft text-primary border border-primary/20">
            {house.activeOrdersCount}
          </span>
        </div>
        <p className="text-ink-600 leading-relaxed">
          {house.activeOrdersCount > 0
            ? `Ce pressing traite actuellement ${house.activeOrdersCount} commande(s) en cours (collecte, nettoyage ou livraison).`
            : "Aucune commande en cours pour ce pressing actuellement."}
        </p>
      </div>

      <div className="space-y-2">
        <Link
          href={`/admin/dispatch?houseId=${house.id}`}
          className="p-3.5 rounded-xl border-2 border-border-strong bg-card hover:bg-surface-hover transition-colors flex items-center justify-between font-bold text-heading"
        >
          <div className="flex items-center gap-2.5">
            <Truck className="size-4 text-violet-600" />
            <span>Voir dans la console de dispatch</span>
          </div>
          <ArrowUpRight className="size-3.5 text-ink-400" />
        </Link>

        <Link
          href={`/admin/orders?houseId=${house.id}`}
          className="p-3.5 rounded-xl border-2 border-border-strong bg-card hover:bg-surface-hover transition-colors flex items-center justify-between font-bold text-heading"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-primary" />
            <span>Consulter l&apos;historique de toutes les commandes</span>
          </div>
          <ArrowUpRight className="size-3.5 text-ink-400" />
        </Link>
      </div>
    </div>
  );
}
