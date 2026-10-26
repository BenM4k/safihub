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
  const t = useTranslations("admin.customers.mergeDialog");

  return (
    <div className="space-y-3">
      <InputGroup className="h-9">
        <InputGroupAddon>
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchGuestPlaceholder")}
          className="text-xs"
        />
      </InputGroup>

      <div className="divide-y divide-border border border-border rounded-lg max-h-60 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">{t("noGuestsFound")}</div>
        ) : (
          candidates.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => onSelect(g)}
              className={`w-full text-left p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedGuest?.id === g.id ? "bg-primary/10 font-bold text-primary" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-foreground">{formatCustomerName(g.name, g.contactPhone)}</div>
                <div className="text-2xs text-muted-foreground">
                  {g.contactPhone || t("noPhone")} · {t("ordersCount", { count: g.ordersCount })}
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
