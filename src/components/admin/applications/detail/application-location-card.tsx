import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";

interface ApplicationLocationCardProps {
  neighborhoodName?: string | null;
  neighborhoodText?: string | null;
  addressNote?: string | null;
}

export async function ApplicationLocationCard({
  neighborhoodName,
  neighborhoodText,
  addressNote,
}: ApplicationLocationCardProps) {
  const t = await getTranslations("admin.applications");

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-xs stack gap-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <MapPin className="size-4 text-primary" />
        <span>{t("location")}</span>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground block">{t("neighborhood")} :</span>
          <span className="font-semibold text-foreground">
            {neighborhoodName || neighborhoodText || t("notProvided")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">{t("landmark")} :</span>
          <span className="text-foreground">{addressNote || "—"}</span>
        </div>
      </div>
    </div>
  );
}
