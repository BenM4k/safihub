"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Building2, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
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
      <TableRow className={`hover:bg-muted/40 transition-colors ${log.isReversed ? "bg-muted/20 opacity-70" : ""}`}>
        <TableCell className="py-3 px-3 font-mono font-bold text-foreground whitespace-nowrap">
          {formatFrenchDate(log.createdAt)}
        </TableCell>
        <TableCell className="py-3 px-3">
          <div className="font-bold text-foreground text-xs">{log.payeeName}</div>
          {log.payeeNeighborhood && (
            <div className="text-2xs text-muted-foreground">{log.payeeNeighborhood}</div>
          )}
          {log.payeePhone && <PhoneCell phone={log.payeePhone} />}
        </TableCell>
        <TableCell className="py-3 px-2 text-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold border ${
              isHouse
                ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            }`}
          >
            {isHouse ? <Building2 className="size-3" /> : <Bike className="size-3" />}
            <span>{isHouse ? "Pressing" : "Coursier"}</span>
          </span>
        </TableCell>
        <TableCell className="py-3 px-2 font-mono text-2xs text-muted-foreground hidden sm:table-cell">
          {log.period || "—"}
        </TableCell>
        <TableCell className="py-3 px-3 text-right">
          <MoneyCell amount={log.amount} currency={log.currency} isCancelled={log.isReversed} />
        </TableCell>
        <TableCell className="py-3 px-2 text-foreground font-medium text-xs hidden md:table-cell">
          {methodLabels[log.method] || log.method}
        </TableCell>
        <TableCell className="py-3 px-2 font-mono text-2xs text-muted-foreground hidden lg:table-cell">
          {log.reference || "—"}
        </TableCell>
        <TableCell className="py-3 px-2 text-foreground text-xs hidden md:table-cell">
          {log.operatorName || "Opérateur"}
        </TableCell>
        <TableCell className="py-3 px-3 text-center">
          {log.isReversed ? (
            <div className="flex flex-col items-center gap-0.5">
              <StatusPill status="cancelled" />
              {log.reversalReason && (
                <span className="text-3xs text-muted-foreground italic max-w-xs truncate" title={log.reversalReason}>
                  {log.reversalReason}
                </span>
              )}
            </div>
          ) : (
            <StatusPill status="settled" customLabel="Validé" />
          )}
        </TableCell>
        <TableCell className="py-3 px-3 text-right whitespace-nowrap">
          {log.isReversed ? (
            <span className="text-2xs text-muted-foreground italic">Annulée</span>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              className="h-9 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 rounded-lg"
              title="Annuler ce règlement"
            >
              <Undo2 className="size-3.5" />
              <span>Annuler</span>
            </Button>
          )}
        </TableCell>
      </TableRow>

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
                <span className="font-bold text-foreground">{log.payeeName}</span> d&apos;un montant de{" "}
                <span className="font-bold text-foreground">{log.amount.toLocaleString()} CDF</span>.
              </p>
              <p className="p-2.5 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 font-medium">
                Conséquence comptable : Une contre-passation compensatoire sera inscrite dans le grand livre. Le solde restant dû du bénéficiaire sera automatiquement réaugmenté.
              </p>
            </div>
          }
          confirmLabel="Confirmer l'annulation"
          variant="destructive"
          requireReason={true}
          reasonLabel="Motif de l'annulation"
          reasonPlaceholder="Préciser la raison..."
        />
      )}
    </>
  );
}
