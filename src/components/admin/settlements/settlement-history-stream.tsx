import { getTranslations } from "next-intl/server";
import { getAdminSettlementHistory } from "@/services/admin";
import { SettlementHistoryTable } from "./settlement-history-table";

export async function SettlementHistoryStream() {
  const [t, historyResult] = await Promise.all([
    getTranslations("admin.settlements"),
    getAdminSettlementHistory(100),
  ]);

  return (
    <div className="space-y-3 animate-enter-fast">
      {!historyResult.ok && (
        <div
          role="alert"
          className="p-4 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-medium"
        >
          {t("errorDescription")}
        </div>
      )}
      <SettlementHistoryTable
        logs={historyResult.ok ? historyResult.value : []}
      />
    </div>
  );
}
