"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { formatFrenchDate, formatFrenchDateTime } from "@/lib/cash-formatters";
import { HistoryRowActions } from "./history-row-actions";
import type { ReconciliationLogRow } from "./reconciliation-history-table";

interface HistoryTableRowProps {
  log: ReconciliationLogRow;
  isExpanded: boolean;
  onToggleNote: (id: string) => void;
}

export function HistoryTableRow({
  log,
  isExpanded,
  onToggleNote,
}: HistoryTableRowProps) {
  const isCancelled = log.note?.includes("[ANNULÉE") || false;

  return (
    <TableRow
      className={`hover:bg-muted/40 transition-colors ${
        isCancelled ? "bg-muted/20 opacity-75" : ""
      }`}
    >
      <TableCell className="py-3 px-4 font-mono font-bold text-foreground">
        {formatFrenchDate(log.businessDate)}
      </TableCell>
      <TableCell className="py-3 px-4 font-semibold text-foreground">
        <div>{log.courierName ?? log.courierId}</div>
        <PhoneCell phone={log.courierPhone} />
      </TableCell>
      <TableCell className="py-3 px-4">
        <MoneyCell amount={log.expectedAmount} currency={log.currency} isCancelled={isCancelled} />
      </TableCell>
      <TableCell className="py-3 px-4">
        <MoneyCell amount={log.receivedAmount} currency={log.currency} isCancelled={isCancelled} />
      </TableCell>
      <TableCell className="py-3 px-4">
        <MoneyCell
          amount={log.difference}
          currency={log.currency}
          isDiscrepancy={!isCancelled}
          isCancelled={isCancelled}
        />
      </TableCell>
      <TableCell className="py-3 px-4 text-center">
        {isCancelled ? (
          <StatusPill status="cancelled" />
        ) : log.difference === 0 ? (
          <StatusPill status="reconciled" />
        ) : log.difference < 0 ? (
          <StatusPill status="shortage" />
        ) : (
          <StatusPill status="surplus" />
        )}
      </TableCell>
      <TableCell className="py-3 px-4 text-foreground font-medium hidden md:table-cell">
        {log.reconcilerName || (log.reconciledBy ? `Opérateur (${log.reconciledBy.slice(0, 6)})` : "—")}
      </TableCell>
      <TableCell className="py-3 px-4 text-xs text-muted-foreground font-mono hidden lg:table-cell">
        {formatFrenchDateTime(log.createdAt)}
      </TableCell>
      <TableCell className="py-3 px-4 text-muted-foreground max-w-xs hidden sm:table-cell">
        {log.note ? (
          <div>
            <p
              onClick={() => onToggleNote(log.id)}
              className={`cursor-pointer hover:text-foreground ${
                isExpanded ? "break-words" : "truncate"
              }`}
              title="Cliquer pour afficher la note complète"
            >
              {log.note}
            </p>
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
        <HistoryRowActions
          reconciliationId={log.id}
          courierName={log.courierName || log.courierId}
          businessDate={log.businessDate}
          isCancelled={isCancelled}
        />
      </TableCell>
    </TableRow>
  );
}
