"use client";

import Link from "next/link";
import { ShoppingBag, ArrowUpRight, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { AdminHouseRow } from "../types";

interface HouseTabOrdersProps {
  house: AdminHouseRow;
}

export function HouseTabOrders({ house }: HouseTabOrdersProps) {
  return (
    <div className="space-y-5 text-xs">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ShoppingBag className="size-4 text-primary" />
            <span>Commandes actives</span>
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {house.activeOrdersCount}
          </span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {house.activeOrdersCount > 0
            ? `Ce pressing traite actuellement ${house.activeOrdersCount} commande(s) en cours (collecte, nettoyage ou livraison).`
            : "Aucune commande en cours pour ce pressing actuellement."}
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Link
          href={`/admin/dispatch?houseId=${house.id}`}
          className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between font-semibold text-foreground"
        >
          <div className="flex items-center gap-2.5">
            <Truck className="size-4 text-violet-600 dark:text-violet-400" />
            <span>Voir dans la console de dispatch</span>
          </div>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </Link>

        <Link
          href={`/admin/orders?houseId=${house.id}`}
          className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between font-semibold text-foreground"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-primary" />
            <span>Consulter l&apos;historique de toutes les commandes</span>
          </div>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
