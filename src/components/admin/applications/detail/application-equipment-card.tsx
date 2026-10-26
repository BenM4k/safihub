import { getTranslations } from "next-intl/server";
import { Building2, Droplets, Zap } from "lucide-react";

interface ApplicationEquipmentCardProps {
  servicesNote?: string | null;
  hoursNote?: string | null;
  message?: string | null;
}

export async function ApplicationEquipmentCard({
  servicesNote,
  hoursNote,
  message,
}: ApplicationEquipmentCardProps) {
  const t = await getTranslations("admin.applications");

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-xs stack gap-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Building2 className="size-4 text-primary" />
        <span>{t("equipment")}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-muted/30 rounded-lg stack gap-1 border border-border/50">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Droplets className="size-3.5 text-blue-500" />
            {t("waterSupply")}
          </span>
          <span className="font-medium text-foreground">{servicesNote || t("standardFallback")}</span>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg stack gap-1 border border-border/50">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" />
            {t("electricitySupply")}
          </span>
          <span className="font-medium text-foreground">{hoursNote || t("standardFallback")}</span>
        </div>
      </div>
      {message && (
        <div className="pt-2 border-t border-border text-xs">
          <span className="text-muted-foreground block mb-1">{t("messageLabel")}</span>
          <p className="text-foreground italic bg-muted/20 p-3 rounded-lg leading-relaxed border border-border/50">
            &quot;{message}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
