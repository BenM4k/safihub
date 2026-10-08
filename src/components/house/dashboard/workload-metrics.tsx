import { Clock, Waves, CheckCircle2, PackageCheck, Gauge } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { HouseDashboardMetrics } from "@/dal";

export async function WorkloadMetrics({
  metrics,
}: {
  metrics: HouseDashboardMetrics;
}) {
  const t = await getTranslations("house.dashboard");

  const capacityPercent =
    metrics.dailyCapacity && metrics.dailyCapacity > 0
      ? Math.min(
          100,
          Math.round((metrics.todayOrdersCount / metrics.dailyCapacity) * 100)
        )
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {t("todayWorkload")}
        </h2>
        {capacityPercent !== null && (
          <span className="text-xs font-semibold text-slate-500">
            {metrics.todayOrdersCount} / {metrics.dailyCapacity} commandes ({capacityPercent}%)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Waiting */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.waitingAcceptanceCount}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("waitingAcceptance")}
            </p>
          </div>
        </div>

        {/* Washing / In process */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Waves className="size-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.washingCount}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("washing")}
            </p>
          </div>
        </div>

        {/* Ready */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="size-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.readyCount}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("ready")}
            </p>
          </div>
        </div>

        {/* Completed today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <PackageCheck className="size-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {metrics.completedTodayCount}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t("completedToday")}
            </p>
          </div>
        </div>
      </div>

      {/* Capacity progress bar if set */}
      {capacityPercent !== null && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Gauge className="size-3.5 text-violet-600" />
              {t("capacityUsed")}
            </span>
            <span className="font-bold text-slate-900">
              {capacityPercent}% ({metrics.todayOrdersCount}/{metrics.dailyCapacity})
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                capacityPercent >= 90
                  ? "bg-rose-500"
                  : capacityPercent >= 70
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
