"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Building2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { formatFrenchDate } from "@/lib/cash-formatters";
import { reverseSettlementAction } from "@/actions/admin-settlements.actions";
import type { SettlementHistoryRow } from "./types";

interface SettlementHistoryRowProps {
  log: SettlementHistoryRow;
}

export function SettlementHistoryRowItem({ log }: SettlementHistoryRowProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isHouse = log.payeeType === "house";
  const methodLabels: Record<string, string> = {
    mobile_money: "Mobile Money",
    bank: "Banque",
    cash: "Espèces",
  };

  const handleConfirmReversal = async (reason?: string) => {
    if (!reason?.trim() || reason.trim().length < 3) {
      return { ok: false, error: "Un motif d'annulation explicite (min. 3 caractères) est requis." };
    }

    const res = await reverseSettlementAction({
      settlementId: log.id,
      reason: reason.trim(),
    });

    if (res.ok) {
      router.refresh();
      return { ok: true };
    }

    return { ok: false, error: res.error || "Échec de l'annulation" };
  };

  return (
    <>
      <tr className={`hover:bg-surface/60 transition-colors ${log.isReversed ? "bg-surface/30 opacity-70" : ""}`}>
        <td className="py-3 px-3 font-mono font-bold text-heading whitespace-nowrap">
          {formatFrenchDate(log.createdAt)}
        </td>
        <td className="py-3 px-3">
          <div className="font-bold text-heading text-xs">{log.payeeName}</div>
          {log.payeeNeighborhood && (
            <div className="text-2xs text-ink-500">{log.payeeNeighborhood}</div>
          )}
          {log.payeePhone && <PhoneCell phone={log.payeePhone} />}
        </td>
        <td className="py-3 px-2 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold border ${
              isHouse
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isHouse ? <Building2 className="size-3" /> : <Bike className="size-3" />}
            <span>{isHouse ? "Pressing" : "Coursier"}</span>
          </span>
        </td>
        <td className="py-3 px-2 font-mono text-2xs text-ink-600 hidden sm:table-cell">
          {log.period || "—"}
        </td>
        <td className="py-3 px-3 text-right">
          <MoneyCell amount={log.amount} currency={log.currency} isCancelled={log.isReversed} />
        </td>
        <td className="py-3 px-2 text-ink-700 font-medium text-xs hidden md:table-cell">
          {methodLabels[log.method] || log.method}
        </td>
        <td className="py-3 px-2 font-mono text-2xs text-ink-600 hidden lg:table-cell">
          {log.reference || "—"}
        </td>
        <td className="py-3 px-2 text-ink-700 text-xs hidden md:table-cell">
          {log.operatorName || "Opérateur"}
        </td>
        <td className="py-3 px-3 text-center">
          {log.isReversed ? (
            <div className="flex flex-col items-center gap-0.5">
              <StatusPill status="cancelled" />
              {log.reversalReason && (
                <span className="text-3xs text-ink-500 italic max-w-xs truncate" title={log.reversalReason}>
                  {log.reversalReason}
                </span>
              )}
            </div>
          ) : (
            <StatusPill status="settled" customLabel="Validé" />
          )}
        </td>
        <td className="py-3 px-3 text-right whitespace-nowrap">
          {log.isReversed ? (
            <span className="text-2xs text-ink-400 italic">Annulée</span>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              className="min-h-[40px] h-10 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive-light/60 gap-1 rounded-lg"
              title="Annuler ce règlement"
            >
              <Undo2 className="size-3.5" />
              <span>Annuler</span>
            </Button>
          )}
        </td>
      </tr>

      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmReversal}
          title="Annuler le règlement"
          description={
            <div className="space-y-2 text-xs">
              <p>
                Vous êtes sur le point d&apos;annuler le règlement de{" "}
                <span className="font-bold text-heading">{log.payeeName}</span> d&apos;un montant de{" "}
                <span className="font-bold text-heading">{log.amount.toLocaleString()} CDF</span>.
              </p>
              <p className="p-2.5 bg-destructive-light text-destructive-base rounded-lg border border-destructive-base/20 font-medium">
                Conséquence comptable : Une contre-passation compensatoire sera inscrite dans le grand livre. Le solde restant dû du bénéficiaire sera automatiquement réaugmenté.
              </p>
            </div>
          }
          confirmLabel="Confirmer l'annulation"
          variant="destructive"
          requireReason={true}
          reasonLabel="Motif obligatoire de l'annulation"
          reasonPlaceholder="Ex. Erreur de compte bancaire, doublon de saisie..."
        />
      )}
    </>
  );
}
