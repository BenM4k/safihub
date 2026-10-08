import { getTranslations } from "next-intl/server";
import type { ZoneRecord } from "@/dal";
import { ZoneForm } from "./zone-form";

interface ZonesCardProps {
  zones: ZoneRecord[];
}

export async function ZonesCard({ zones }: ZonesCardProps) {
  const t = await getTranslations("admin.neighborhoods");

  return (
    <div className="bg-white p-5 rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">{t("zonesCard")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {zones.length} zone(s)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-semibold text-heading flex items-center gap-2"
          >
            <span>{zone.name}</span>
            <span className="text-[10px] text-muted-foreground">
              #{zone.sortOrder}
            </span>
          </div>
        ))}
      </div>

      <ZoneForm />
    </div>
  );
}
