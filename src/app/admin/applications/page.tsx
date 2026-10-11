import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listAdminPartnerApplications } from "@/services/admin/partner-application.service";
import { ApplicationsTable } from "@/components/admin/applications/applications-table";
import type { ApplicationStatus } from "@/services/db/schema";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin.applications");
  const sp = await searchParams;

  const validStatus =
    sp.status === "pending" || sp.status === "approved" || sp.status === "rejected"
      ? (sp.status as ApplicationStatus)
      : undefined;

  const res = await listAdminPartnerApplications({
    status: validStatus,
  });

  const applications = res.ok ? res.value.applications : [];

  const tabs: { label: string; value?: ApplicationStatus }[] = [
    { label: t("all"), value: undefined },
    { label: t("pending"), value: "pending" },
    { label: t("approved"), value: "approved" },
    { label: t("rejected"), value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {tabs.map((tab) => {
          const isActive = validStatus === tab.value;
          const href = tab.value
            ? `/admin/applications?status=${tab.value}`
            : "/admin/applications";

          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-heading hover:bg-slate-100"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  );
}
