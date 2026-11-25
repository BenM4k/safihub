import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { listAdminDisputesPaginated } from "@/services/admin";
import type { AdminDisputesQueryParams } from "@/lib/admin-disputes-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DisputesToolbar } from "./disputes-toolbar";
import { DisputesList } from "./disputes-list";
import { DisputesRetryButton } from "./disputes-retry-button";

interface DisputesStreamContentProps {
  query: AdminDisputesQueryParams;
}

export async function DisputesStreamContent({
  query,
}: DisputesStreamContentProps) {
  const [tAdmin, disputesRes] = await Promise.all([
    getTranslations("admin"),
    listAdminDisputesPaginated(query),
  ]);

  if (!disputesRes.ok) {
    return (
      <Alert
        variant="destructive"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-enter"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <div>
            <AlertTitle>{tAdmin("disputes.loadErrorTitle")}</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {tAdmin("disputes.loadErrorDescription")}
            </AlertDescription>
          </div>
        </div>
        <DisputesRetryButton label={tAdmin("disputes.retry")} />
      </Alert>
    );
  }

  const data = disputesRes.value;

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {tAdmin("dashboard.openDisputes")} :{" "}
        {tAdmin("disputes.openRatio", {
          open: data.openCount,
          total: data.totalAllCount,
        })}
      </p>

      <DisputesToolbar
        activeStatus={query.status}
        counts={{
          all: data.totalAllCount,
          open: data.openCount,
          resolved: data.resolvedCount,
        }}
      />

      <DisputesList
        disputes={data.disputes}
        page={data.page}
        pageSize={data.pageSize}
        totalItems={data.totalCount}
      />
    </div>
  );
}
