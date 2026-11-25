import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { guardAdminRoute } from "@/services/auth";
import { listAdminDisputes } from "@/services/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DisputesList } from "@/components/admin/disputes/disputes-list";
import { DisputesRetryButton } from "@/components/admin/disputes/disputes-retry-button";

export const metadata: Metadata = {
  title: "Litiges | Console SafiHub Admin",
  description: "Gestion et résolution des litiges clients et pressing",
};

export default async function AdminDisputesPage() {
  await guardAdminRoute();
  const [tAdmin, disputesRes] = await Promise.all([
    getTranslations("admin"),
    listAdminDisputes(),
  ]);

  if (!disputesRes.ok) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {tAdmin("nav.disputes")}
            </h1>
          </div>
        </div>

        <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
      </div>
    );
  }

  const disputes = disputesRes.value;
  const openCount = disputes.filter((d) => d.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {tAdmin("nav.disputes")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {tAdmin("dashboard.openDisputes")} :{" "}
            {tAdmin("disputes.openRatio", { open: openCount, total: disputes.length })}
          </p>
        </div>
      </div>

      <DisputesList disputes={disputes} />
    </div>
  );
}

