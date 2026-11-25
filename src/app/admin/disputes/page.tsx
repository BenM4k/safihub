import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminDisputesSearchParams } from "@/lib/admin-disputes-query";
import { DisputesStreamContent } from "@/components/admin/disputes/disputes-stream-content";
import { DisputesSkeleton } from "@/components/admin/disputes/disputes-skeleton";

export const metadata: Metadata = {
  title: "Litiges | Console SafiHub Admin",
  description: "Gestion et résolution des litiges clients et pressing",
};

interface AdminDisputesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminDisputesPage({
  searchParams,
}: AdminDisputesPageProps) {
  const [, rawSearchParams, tAdmin] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin"),
  ]);

  const query = parseAdminDisputesSearchParams(rawSearchParams);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-enter">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {tAdmin("nav.disputes")}
        </h1>
      </div>

      <Suspense fallback={<DisputesSkeleton />}>
        <DisputesStreamContent query={query} />
      </Suspense>
    </div>
  );
}
