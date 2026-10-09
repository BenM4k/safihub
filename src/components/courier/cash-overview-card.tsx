"use client";

import { useTranslations } from "next-intl";
import {
  Wallet,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Receipt,
  Coins,
} from "lucide-react";
import type { CourierCashOverview } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface CashOverviewCardProps {
  data: CourierCashOverview;
}

export function CashOverviewCard({ data }: CashOverviewCardProps) {
  const t = useTranslations("courier.cash");

  const ceilingPercent = data.cashCeiling
    ? Math.min(100, Math.round((data.cashHeld / data.cashCeiling) * 100))
    : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* Warning Banner if Ceiling Exceeded (AC 13) */}
      {data.isCeilingExceeded && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-xs">
          <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-950 text-sm">
              {t("ceilingWarning")}
            </p>
          </div>
        </div>
      )}

      {/* Main Cash Held Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("held")}
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Wallet className="size-5" />
          </div>
        </div>

        <div>
          <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
            {data.cashHeld.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-slate-500 ml-1.5">CDF</span>
        </div>

        {/* Ceiling Progress Bar */}
        {data.cashCeiling !== null && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t("ceiling")}</span>
              <span className="font-mono font-semibold text-slate-700">
                {data.cashCeiling.toLocaleString()} CDF ({ceilingPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.isCeilingExceeded
                    ? "bg-rose-600"
                    : ceilingPercent > 80
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${ceilingPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Owed to Each Party (Done when: sees amount owed to each party) */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("breakdownTitle")}
        </h2>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 text-xs font-semibold">
              <Building2 className="size-3.5" />
              <span>Pressings</span>
            </div>
            <p className="font-mono font-bold text-purple-950 text-base">
              {data.owedToHouses.toLocaleString()} CDF
            </p>
            <p className="text-[10px] text-purple-600/90 leading-tight">
              {t("owedToHouses")}
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold">
              <Coins className="size-3.5" />
              <span>SafiHub</span>
            </div>
            <p className="font-mono font-bold text-blue-950 text-base">
              {data.owedToOwner.toLocaleString()} CDF
            </p>
            <p className="text-[10px] text-blue-600/90 leading-tight">
              {t("owedToOwner")}
            </p>
          </div>
        </div>
      </div>

      {/* Security Deposit & Float Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Caution</span>
          </div>
          <p className="font-mono font-bold text-slate-900 text-sm">
            {data.securityDeposit.toLocaleString()} CDF
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Receipt className="size-3.5 text-blue-600" />
            <span>Fond de caisse</span>
          </div>
          <p className="font-mono font-bold text-slate-900 text-sm">
            {data.changeFloat.toLocaleString()} CDF
          </p>
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("recentTransactions")}
        </h2>

        {data.recentLedgerEntries.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            {t("noTransactions")}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {data.recentLedgerEntries.map((tx) => (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {tx.entryType.replace("_", " ")}
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
    </div>
  );
}
