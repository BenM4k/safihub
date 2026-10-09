"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { CourierCashOverview } from "@/dal";

const KNOWN_ENTRY_TYPES = [
  "cash_collected",
  "cash_remitted",
  "owed_to_house",
  "owed_to_owner",
  "courier_pay",
  "deposit_held",
  "deposit_released",
  "float_issued",
  "float_returned",
  "house_settlement_paid",
  "courier_pay_paid",
  "discrepancy",
  "reversal",
] as const;

type KnownEntryType = (typeof KNOWN_ENTRY_TYPES)[number];

function isKnownEntryType(type: string): type is KnownEntryType {
  return (KNOWN_ENTRY_TYPES as readonly string[]).includes(type);
}

interface CashLedgerListProps {
  entries: CourierCashOverview["recentLedgerEntries"];
}

export function CashLedgerList({ entries }: CashLedgerListProps) {
  const t = useTranslations("courier.cash");

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {t("recentTransactions")}
      </h2>

      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">
          {t("noTransactions")}
        </p>
      ) : (
        <div className="divide-y divide-slate-100 text-xs">
          {entries.map((tx) => (
            <div
              key={tx.id}
              className="py-2.5 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {isKnownEntryType(tx.entryType)
                      ? t(`entryTypes.${tx.entryType}`)
                      : tx.entryType.replace("_", " ")}
                  </Badge>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString([], {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                {tx.note && (
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {tx.note}
                  </p>
                )}
              </div>

              <span className="font-mono font-bold text-slate-900 shrink-0">
                {tx.amount.toLocaleString()} {tx.currency}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
