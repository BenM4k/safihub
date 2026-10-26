"use client";

import { History, Calendar, FileText, Hash } from "lucide-react";
import { formatDateTime } from "@/lib/order-formatters";
import { Separator } from "@/components/ui/separator";
import type { AdminHouseRow } from "../types";

interface HouseTabHistoryProps {
  house: AdminHouseRow;
}

export function HouseTabHistory({ house }: HouseTabHistoryProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="font-semibold text-foreground flex items-center gap-1.5">
        <History className="size-4 text-primary" />
        <span>Informations d&apos;audit &amp; Horodatage</span>
      </div>

      <div className="space-y-3 text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>Date de création / contrat</span>
          </span>
          <span className="font-medium text-foreground">
            {formatDateTime(house.createdAt)}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            <span>Dernière mise à jour</span>
          </span>
          <span className="font-medium text-foreground">
            {house.updatedAt ? formatDateTime(house.updatedAt) : "—"}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hash className="size-3.5" />
            <span>Identifiant UUID</span>
          </span>
          <span className="font-mono text-[11px] text-foreground truncate max-w-[180px]" title={house.id}>
            {house.id}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hash className="size-3.5" />
            <span>Slug URL public</span>
          </span>
          <span className="font-mono text-[11px] text-primary font-bold">
            {house.slug}
          </span>
        </div>
      </div>
    </div>
  );
}
