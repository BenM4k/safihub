import { getTranslations } from "next-intl/server";
import { AlertTriangle, Store } from "lucide-react";
import { getHousesWithoutCourier } from "@/services/admin";
import { Badge } from "@/components/ui/badge";

export async function HousesWithoutCourierAlert() {
  const t = await getTranslations("admin.couriers");
  const res = await getHousesWithoutCourier();
  if (!res.ok || res.value.length === 0) return null;

  const houses = res.value;

  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2.5 animate-in fade-in-50"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold">{t("housesAlertTitle")}</p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {t("housesAlertDesc")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1 pl-6">
        {houses.map((h) => (
          <Badge
            key={h.id}
            variant="outline"
            className="bg-card text-heading border-border text-xs py-1 px-2.5 gap-1.5 shadow-2xs"
          >
            <Store className="size-3 text-muted-foreground" />
            <span className="font-semibold">{h.name}</span>
            <span className="text-muted-foreground font-normal">
              ({h.neighborhoodName} • {h.zoneName})
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
