import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import { listAdminCatalog } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { CatalogueTabsContainer } from "./catalogue-tabs-container";

export async function CatalogueStreamContent() {
  const [t, catalogRes] = await Promise.all([
    getTranslations("admin.catalogue"),
    listAdminCatalog(),
  ]);

  if (!catalogRes.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft font-sans animate-enter">
        <div className="size-11 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            {t("errorTitle")}
          </h2>
          <p className="text-xs text-destructive">{t("errorDescription")}</p>
        </div>
        <Button asChild size="sm" className="min-h-10 px-4 text-xs press">
          <Link href="/admin/catalogue">
            <RefreshCw className="size-3.5 mr-1.5" />
            {t("retry")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <CatalogueTabsContainer
      services={catalogRes.value.services}
      items={catalogRes.value.items}
      fabrics={catalogRes.value.fabrics}
      requests={catalogRes.value.requests}
    />
  );
}
