"use client";

import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerRow } from "../types";

interface MergeStepSelectGuestProps {
  candidates: CustomerRow[];
  selectedGuest: CustomerRow | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (customer: CustomerRow) => void;
}

export function MergeStepSelectGuest({
  candidates,
  selectedGuest,
  search,
  onSearchChange,
  onSelect,
}: MergeStepSelectGuestProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher le compte invité par nom ou téléphone…"
          className="pl-9 h-10 text-xs border-2 border-border-strong rounded-lg"
        />
      </div>

      <div className="divide-y divide-border-strong border-2 border-border-strong rounded-xl max-h-60 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-ink-400">Aucun compte invité trouvé.</div>
        ) : (
          candidates.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => onSelect(g)}
              className={`w-full text-left p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-surface ${
                selectedGuest?.id === g.id ? "bg-primary-soft font-bold text-primary" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-heading">{formatCustomerName(g.name, g.contactPhone)}</div>
                <div className="text-2xs text-ink-500">
                  {g.contactPhone || "Sans téléphone"} · {g.ordersCount} commande(s)
                </div>
              </div>
              {selectedGuest?.id === g.id && <Check className="size-4 text-primary" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
