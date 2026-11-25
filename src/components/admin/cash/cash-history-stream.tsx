import { getAdminReconciliationHistory } from "@/services/admin";
import { ReconciliationHistoryTable } from "./reconciliation-history-table";

export async function CashHistoryStream() {
  const historyResult = await getAdminReconciliationHistory(100);
  const historyLogs = historyResult.ok ? historyResult.value : [];

  return (
    <div className="pt-2 animate-enter">
      <ReconciliationHistoryTable logs={historyLogs} />
    </div>
  );
}
