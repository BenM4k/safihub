"use client";

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
    <tr
      className={`hover:bg-surface/60 transition-colors ${
        isCancelled ? "bg-surface/30 opacity-75" : ""
      }`}
    >
      <td className="py-3 px-4 font-mono font-bold text-heading">
        {formatFrenchDate(log.businessDate)}
      </td>
      <td className="py-3 px-4 font-semibold text-heading">
        <div>{log.courierName ?? log.courierId}</div>
        <PhoneCell phone={log.courierPhone} />
      </td>
      <td className="py-3 px-4">
        <MoneyCell amount={log.expectedAmount} currency={log.currency} isCancelled={isCancelled} />
      </td>
      <td className="py-3 px-4">
        <MoneyCell amount={log.receivedAmount} currency={log.currency} isCancelled={isCancelled} />
      </td>
      <td className="py-3 px-4">
        <MoneyCell
          amount={log.difference}
          currency={log.currency}
          isDiscrepancy={!isCancelled}
          isCancelled={isCancelled}
        />
      </td>
      <td className="py-3 px-4 text-center">
        {isCancelled ? (
          <StatusPill status="cancelled" />
        ) : log.difference === 0 ? (
          <StatusPill status="reconciled" />
        ) : log.difference < 0 ? (
          <StatusPill status="shortage" />
        ) : (
          <StatusPill status="surplus" />
        )}
      </td>
      <td className="py-3 px-4 text-heading font-medium hidden md:table-cell">
        {log.reconcilerName || (log.reconciledBy ? `Opérateur (${log.reconciledBy.slice(0, 6)})` : "—")}
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground font-mono hidden lg:table-cell">
        {formatFrenchDateTime(log.createdAt)}
      </td>
      <td className="py-3 px-4 text-muted-foreground max-w-xs hidden sm:table-cell">
        {log.note ? (
          <div>
            <p
              onClick={() => onToggleNote(log.id)}
              className={`cursor-pointer hover:text-heading ${
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
      </td>
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <HistoryRowActions
          reconciliationId={log.id}
          courierName={log.courierName || log.courierId}
          businessDate={log.businessDate}
          isCancelled={isCancelled}
        />
      </td>
    </tr>
  );
}
