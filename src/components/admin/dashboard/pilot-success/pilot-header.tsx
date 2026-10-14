import { getTranslations } from "next-intl/server";
import { Target, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PilotHeaderProps {
  metCount: number;
  totalCount: number;
}

export async function PilotHeader({ metCount, totalCount }: PilotHeaderProps) {
  const t = await getTranslations("admin.dashboard");
  const percent = Math.round((metCount / totalCount) * 100);
  const isAllMet = metCount === totalCount;

  return (
    <div className="space-y-4 pb-4 border-b border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              <Target className="size-3" />
              <span>{t("pilotPhaseBadge")}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-heading tracking-tight font-display">
            {t("successCriteriaTitle")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {t("successCriteriaSubtitle")}
          </p>
        </div>

        {/* Global Pilot Health Meter */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0 bg-surface sm:bg-transparent p-3.5 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-border">
          <div className="flex items-center gap-2">
            {isAllMet ? (
              <CheckCircle2 className="size-4.5 text-[#079455] shrink-0" />
            ) : (
              <AlertCircle className="size-4.5 text-warning shrink-0" />
            )}
            <span className="text-xs font-bold text-heading">
              {t("pilotHealthSummary", { metCount, totalCount })}
            </span>
          </div>

          <div className="w-full sm:w-48 h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percent >= 80 ? "bg-success" : percent >= 50 ? "bg-warning" : "bg-primary"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
