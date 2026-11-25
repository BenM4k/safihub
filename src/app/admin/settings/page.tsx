import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SettingsStreamContent } from "@/components/admin/settings/settings-stream-content";
import { AdminSettingsSkeleton } from "@/components/admin/settings/admin-settings-skeleton";
import { DataExportCard } from "@/components/admin/settings/data-export-card";

export default async function AdminSettingsPage() {
  const [, t] = await Promise.all([
    guardAdminRoute(),
    getTranslations("admin.settings"),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Suspense fallback={<AdminSettingsSkeleton />}>
        <SettingsStreamContent />
      </Suspense>

      <DataExportCard />
    </div>
  );
}
