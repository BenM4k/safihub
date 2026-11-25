import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminApplicationsSearchParams } from "@/lib/admin-applications-query";
import { ApplicationsStreamContent } from "@/components/admin/applications/applications-stream-content";
import { AdminApplicationsSkeleton } from "@/components/admin/applications/admin-applications-skeleton";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const [, rawSearchParams, t] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin.applications"),
  ]);

  const query = parseAdminApplicationsSearchParams(rawSearchParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-enter">
        <div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <Suspense fallback={<AdminApplicationsSkeleton />}>
        <ApplicationsStreamContent query={query} />
      </Suspense>
    </div>
  );
}
