"use client";

import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerRow } from "../types";

interface MergeStepSelectTargetProps {
  candidates: CustomerRow[];
  selectedGuest: CustomerRow | null;
  selectedTarget: CustomerRow | null;
  search: string;
  isPreselected: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (customer: CustomerRow) => void;
  onBackToGuest: () => void;
}

export function MergeStepSelectTarget({
  candidates,
  selectedGuest,
  selectedTarget,
  search,
  isPreselected,
  onSearchChange,
  onSelect,
  onBackToGuest,
}: MergeStepSelectTargetProps) {
  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-lg bg-surface border-2 border-border-strong text-xs flex items-center justify-between">
        <div>
          <span className="text-2xs text-ink-500 font-semibold block">Compte invité sélectionné :</span>
          <span className="font-bold text-heading">{formatCustomerName(selectedGuest?.name, selectedGuest?.contactPhone)}</span>
          <span className="text-2xs text-ink-500 ml-2">({selectedGuest?.contactPhone || "—"})</span>
        </div>
        {!isPreselected && (
          <button type="button" onClick={onBackToGuest} className="text-primary text-xs underline font-bold">
            Modifier
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher le compte cible inscrit (nom, e-mail, téléphone)…"
          className="pl-9 h-10 text-xs border-2 border-border-strong rounded-lg"
        />
      </div>

      <div className="divide-y divide-border-strong border-2 border-border-strong rounded-xl max-h-56 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-ink-400">Aucun compte inscrit actif trouvé.</div>
        ) : (
          candidates.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              className={`p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-surface ${
                selectedTarget?.id === t.id ? "bg-primary-soft font-bold text-primary" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-heading">{t.name}</div>
                <div className="text-2xs text-ink-500">{t.email} · {t.contactPhone || "Sans tél"}</div>
              </div>
              {selectedTarget?.id === t.id && <Check className="size-4 text-primary" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
