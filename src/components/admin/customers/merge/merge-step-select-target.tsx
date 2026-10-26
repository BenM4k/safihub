"use client";

import { useTranslations } from "next-intl";
import { Check, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  const t = useTranslations("admin.customers.mergeDialog");

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs flex items-center justify-between">
        <div>
          <span className="text-2xs text-muted-foreground font-semibold block">{t("selectedGuestLabel")}</span>
          <span className="font-bold text-foreground">{formatCustomerName(selectedGuest?.name, selectedGuest?.contactPhone)}</span>
          <span className="text-2xs text-muted-foreground ml-2">({selectedGuest?.contactPhone || "—"})</span>
        </div>
        {!isPreselected && (
          <button type="button" onClick={onBackToGuest} className="text-primary text-xs underline font-bold cursor-pointer">
            {t("modifyBtn")}
          </button>
        )}
      </div>

      <InputGroup className="h-9">
        <InputGroupAddon>
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchTargetPlaceholder")}
          className="text-xs"
        />
      </InputGroup>

      <div className="divide-y divide-border border border-border rounded-lg max-h-56 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">{t("noTargetsFound")}</div>
        ) : (
          candidates.map((tItem) => (
            <button
              type="button"
              key={tItem.id}
              onClick={() => onSelect(tItem)}
              className={`w-full text-left p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedTarget?.id === tItem.id ? "bg-primary/10 font-bold text-primary" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-foreground">{tItem.name}</div>
                <div className="text-2xs text-muted-foreground">{tItem.email} · {tItem.contactPhone || t("noPhone")}</div>
              </div>
              {selectedTarget?.id === tItem.id && <Check className="size-4 text-primary" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
