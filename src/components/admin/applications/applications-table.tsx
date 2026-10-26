import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HouseApplicationRecord } from "@/dal/house-application.dal";

interface ApplicationsTableProps {
  applications: HouseApplicationRecord[];
}

export async function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const t = await getTranslations("admin.applications");

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-border p-12 text-center text-xs text-muted-foreground font-medium">
        {t("noApplications")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {applications.length} {t("all").toLowerCase()}
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
              const statusVariant =
                app.status === "approved"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : app.status === "rejected"
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";

              const statusLabel =
                app.status === "approved"
                  ? t("approved")
                  : app.status === "rejected"
                    ? t("rejected")
                    : t("pending");

              return (
                <TableRow key={app.id}>
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="hover:text-primary transition underline-offset-2 hover:underline"
                    >
                      {app.houseName}
                    </Link>
                    <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                      {t("submittedOn", {
                        date: new Date(app.createdAt).toLocaleDateString("fr-FR"),
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="font-medium text-foreground">{app.contactName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {app.phone}
                    </div>
                    {app.email && (
                      <div className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={app.email}>
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
                    <Badge variant="outline" className={statusVariant}>
                      {statusLabel}
                    </Badge>
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
    </div>
  );
}
