import { StatusPill } from "@/components/admin/shared/status-pill";
import {
  SETTLEMENT_OVERDUE_DAYS_THRESHOLD,
  calculateDaysOverdue,
} from "./period-utils";

interface SettlementStatusBadgeProps {
  balanceOwedCDF: number;
  oldestUnpaidDate?: Date | string | null;
  className?: string;
}

export function SettlementStatusBadge({
  balanceOwedCDF,
  oldestUnpaidDate,
  className = "",
}: SettlementStatusBadgeProps) {
  if (balanceOwedCDF <= 0) {
    return <StatusPill status="settled" customLabel="À jour" className={className} />;
  }

  const daysOverdue = calculateDaysOverdue(oldestUnpaidDate);

  if (daysOverdue > SETTLEMENT_OVERDUE_DAYS_THRESHOLD) {
    return (
      <StatusPill
        status="overdue"
        customLabel={`En retard (${daysOverdue} j)`}
        className={className}
      />
    );
  }

  return <StatusPill status="to_settle" customLabel="À régler" className={className} />;
}
