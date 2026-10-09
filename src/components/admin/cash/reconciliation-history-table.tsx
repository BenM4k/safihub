"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Undo2 } from "lucide-react";
import { ReversalDialog } from "./reversal-dialog";

interface LogRow {
  id: string;
  courierId: string;
  courierName: string | null;
  businessDate: string;
  currency: "CDF" | "USD";
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  status: string;
  note: string | null;
  reconciledBy: string | null;
  createdAt: Date;
}

interface ReconciliationHistoryTableProps {
  logs: LogRow[];
}

export function ReconciliationHistoryTable({ logs }: ReconciliationHistoryTableProps) {
  const t = useTranslations("admin.cash");
  const [reversalOpen, setReversalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("historyTitle")}</h2>
        <Button size="sm" variant="outline" onClick={() => setReversalOpen(true)} className="h-8 text-xs gap-1.5">
          <Undo2 className="size-3.5" />
          {t("reversalBtn")}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-2.5 px-4">{t("dateLabel")}</th>
              <th className="py-2.5 px-4">{t("courier")}</th>
              <th className="py-2.5 px-4">{t("expected")}</th>
              <th className="py-2.5 px-4">{t("received")}</th>
              <th className="py-2.5 px-4">{t("difference")}</th>
              <th className="py-2.5 px-4">{t("noteLabel")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                  {t("noHistory")}
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const hasDiff = log.difference !== 0;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-mono font-medium">{log.businessDate}</td>
                    <td className="py-2.5 px-4 font-semibold text-heading">
                      {log.courierName ?? log.courierId}
                    </td>
                    <td className="py-2.5 px-4">{log.expectedAmount.toLocaleString()} {log.currency}</td>
                    <td className="py-2.5 px-4 font-bold">{log.receivedAmount.toLocaleString()} {log.currency}</td>
                    <td className="py-2.5 px-4 font-semibold">
                      {hasDiff ? (
                        <Badge variant="destructive" className="text-2xs gap-1">
                          <ShieldAlert className="size-3" />
                          {log.difference > 0 ? "+" : ""}{log.difference.toLocaleString()} {log.currency}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">0 {log.currency}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate">
                      {log.note || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {reversalOpen && (
        <ReversalDialog isOpen={true} onClose={() => setReversalOpen(false)} />
      )}
    </div>
  );
}
