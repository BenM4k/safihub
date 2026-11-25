import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { listAdminNeighborhoods, listAdminZones } from "@/services/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ZonesCard } from "./zones-card";
import { NeighborhoodsTable } from "./neighborhoods-table";
import { NeighborhoodForm } from "./neighborhood-form";

export async function NeighborhoodsStreamContent() {
  const [t, zonesRes, neighRes] = await Promise.all([
    getTranslations("admin.neighborhoods"),
    listAdminZones(),
    listAdminNeighborhoods(),
  ]);

  const zones = zonesRes.ok ? zonesRes.value : [];
  const neighborhoods = neighRes.ok ? neighRes.value : [];

  return (
    <div className="space-y-6 animate-enter-fast">
      {(!zonesRes.ok || !neighRes.ok) && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("errorDescription")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ZonesCard zones={zones} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <NeighborhoodsTable neighborhoods={neighborhoods} />
          <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
            <NeighborhoodForm zones={zones} />
          </div>
        </div>
      </div>
    </div>
  );
}
