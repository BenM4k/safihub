import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import { APPLICATIONS_PAGE_SIZE_OPTIONS } from "@/lib/admin-applications-query";
import type { HouseApplicationRecord } from "@/dal/house-application.dal";

interface ApplicationsTableProps {
  applications: HouseApplicationRecord[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
}

export async function ApplicationsTable({
  applications,
  page = 1,
  pageSize = 15,
  totalItems,
}: ApplicationsTableProps) {
  const [t, locale] = await Promise.all([
    getTranslations("admin.applications"),
    getLocale(),
  ]);

  const effectiveTotal = totalItems ?? applications.length;

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-border p-12 text-center text-xs text-muted-foreground font-medium animate-enter-fast">
        {t("noApplications")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-enter-fast">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
          {effectiveTotal} {t("all").toLowerCase()}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3">{t("houseName")}</TableHead>
              <TableHead className="px-4 py-3">{t("applicant")}</TableHead>
              <TableHead className="px-4 py-3">{t("location")}</TableHead>
              <TableHead className="px-4 py-3">{t("status")}</TableHead>
              <TableHead className="px-4 py-3 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const statusTone =
                app.status === "approved"
                  ? "success"
                  : app.status === "rejected"
                  ? "destructive"
                  : "warning";

              const statusLabel =
                app.status === "approved"
                  ? t("approved")
                  : app.status === "rejected"
                  ? t("rejected")
                  : t("pending");

              return (
                <TableRow
                  key={app.id}
                  className="row-interactive animate-enter-fast"
                >
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="hover:text-primary transition underline-offset-2 hover:underline"
                    >
                      {app.houseName}
                    </Link>
                    <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                      {t("submittedOn", {
                        date: new Date(app.createdAt).toLocaleDateString(locale, {
                          timeZone: "Africa/Lubumbashi",
                        }),
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {app.contactName}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {app.phone}
                    </div>
                    {app.email && (
                      <div
                        className="text-[11px] text-muted-foreground truncate max-w-[200px]"
                        title={app.email}
                      >
                        {app.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      {app.neighborhoodName || app.neighborhoodText || "—"}
                    </div>
                    {app.addressNote && (
                      <div className="text-[11px] truncate max-w-[200px]">
                        {app.addressNote}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t("review")} →
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalItems !== undefined && (
        <DataTablePagination
          urlMode
          page={page}
          pageSize={pageSize}
          pageSizeOptions={APPLICATIONS_PAGE_SIZE_OPTIONS}
          totalItems={effectiveTotal}
          hideIfSinglePage
        />
      )}
    </div>
  );
}
