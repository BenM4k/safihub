import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import type { HouseApplicationRecord } from "@/dal/house-application.dal";

interface ApplicationsTableProps {
  applications: HouseApplicationRecord[];
}

export async function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const t = await getTranslations("admin.applications");

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-12 text-center text-xs text-muted-foreground font-medium">
        {t("noApplications")}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {applications.length} {t("all").toLowerCase()}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">{t("houseName")}</th>
              <th className="px-4 py-3">{t("applicant")}</th>
              <th className="px-4 py-3">{t("location")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => {
              const statusVariant =
                app.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : app.status === "rejected"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

              const statusLabel =
                app.status === "approved"
                  ? t("approved")
                  : app.status === "rejected"
                    ? t("rejected")
                    : t("pending");

              return (
                <tr key={app.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">
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
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-heading">{app.contactName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {app.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="font-medium text-heading">
                      {app.neighborhoodName || app.neighborhoodText || "—"}
                    </div>
                    {app.addressNote && (
                      <div className="text-[11px] truncate max-w-[200px]">
                        {app.addressNote}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusVariant}>
                      {statusLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t("review")} →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
