import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { getAdminDisputes } from "@/dal";
import { DisputesList } from "@/components/admin/disputes/disputes-list";

export const metadata: Metadata = {
  title: "Litiges | Console SafiHub Admin",
  description: "Gestion et résolution des litiges clients et pressing",
};

export default async function AdminDisputesPage() {
  await guardAdminRoute();
  const [tAdmin, disputes] = await Promise.all([
    getTranslations("admin"),
    getAdminDisputes(),
  ]);

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

