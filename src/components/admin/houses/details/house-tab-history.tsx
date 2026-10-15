"use client";

import { History, Calendar, FileText, Hash } from "lucide-react";
import { formatDateTime } from "@/lib/order-formatters";
import type { AdminHouseRow } from "../types";

interface HouseTabHistoryProps {
  house: AdminHouseRow;
}

export function HouseTabHistory({ house }: HouseTabHistoryProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-3">
        <div className="font-bold text-heading flex items-center gap-1.5">
          <History className="size-4 text-primary" />
          <span>Informations d&apos;audit &amp; Horodatage</span>
        </div>

        <div className="divide-y divide-border-strong/70 text-ink-700">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Calendar className="size-3.5" />
              <span>Date de création / début de contrat</span>
            </span>
            <span className="font-semibold text-heading">
              {formatDateTime(house.createdAt)}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <FileText className="size-3.5" />
              <span>Dernière mise à jour</span>
            </span>
            <span className="font-semibold text-heading">
              {house.updatedAt ? formatDateTime(house.updatedAt) : "—"}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Hash className="size-3.5" />
              <span>Identifiant UUID</span>
            </span>
            <span className="font-mono text-[11px] text-ink-600 truncate max-w-[180px]" title={house.id}>
              {house.id}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Hash className="size-3.5" />
              <span>Slug URL public</span>
            </span>
            <span className="font-mono text-[11px] text-primary font-bold">
              {house.slug}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
