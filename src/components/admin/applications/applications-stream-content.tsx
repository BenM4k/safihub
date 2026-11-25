import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import { listAdminPartnerApplicationsPaginated } from "@/services/admin/partner-application.service";
import type { AdminApplicationsQueryParams } from "@/lib/admin-applications-query";
import { Button } from "@/components/ui/button";
import { ApplicationsToolbar } from "./applications-toolbar";
import { ApplicationsTable } from "./applications-table";

interface ApplicationsStreamContentProps {
  query: AdminApplicationsQueryParams;
}

export async function ApplicationsStreamContent({
  query,
}: ApplicationsStreamContentProps) {
  const [t, res] = await Promise.all([
    getTranslations("admin.applications"),
    listAdminPartnerApplicationsPaginated(query),
  ]);

  if (!res.ok) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft font-sans animate-enter">
        <div className="size-11 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-heading">{t("loadErrorTitle")}</p>
          <p className="text-xs text-destructive">{t("loadErrorDescription")}</p>
        </div>
        <Button asChild size="sm" className="min-h-10 text-xs">
          <Link href="/admin/applications">
            <RefreshCw className="size-3.5 mr-1.5" />
            {t("retry")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ApplicationsToolbar
        activeStatus={query.status}
        counts={res.value.counts}
      />
      <ApplicationsTable
        applications={res.value.applications}
        page={res.value.page}
        pageSize={res.value.pageSize}
        totalItems={res.value.totalCount}
      />
    </div>
  );
}
