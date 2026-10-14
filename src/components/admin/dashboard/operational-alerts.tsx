import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Send,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { AdminDashboardMetrics } from "@/dal";

interface OperationalAlertsProps {
  metrics: AdminDashboardMetrics;
}

export async function OperationalAlerts({ metrics }: OperationalAlertsProps) {
  const t = await getTranslations("admin.dashboard");

  const pendingCount = metrics.ordersPendingAcceptance;
  const unassignedCount = metrics.unassignedMissionsCount;
  const disputesCount = metrics.activeDisputes;
  const demandCount = metrics.pendingCoverageRequests;

  return (
    <section aria-labelledby="attention-heading" className="space-y-3">
      <h2 id="attention-heading" className="sr-only">
        {t("urgentAttentionTitle")}
      </h2>

      {/* Dominant Item: Full-width Alert Card with Amber Accent */}
      <div className="bg-amber-50/70 border-l-4 border-l-amber-500 border border-amber-200/80 rounded-xl p-5 sm:p-6 transition-shadow hover:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Clock className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  {t("urgentAttentionTitle")}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {pendingCount}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                {t("pendingAcceptance")}
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {t("pendingAcceptanceDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <Link
              href="/admin/dispatch"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer active:scale-[0.98]"
            >
              <span>{t("reviewPendingOrders", { count: pendingCount })}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Compact Row of Stat Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Unassigned Missions Chip */}
        <Link
          href="/admin/dispatch"
          className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              {t("unassignedMissions")}
            </span>
          </div>
          {unassignedCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              {unassignedCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>

        {/* Open Disputes Chip */}
        <Link
          href="/admin/disputes"
          className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              {t("openDisputes")}
            </span>
          </div>
          {disputesCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {disputesCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>

        {/* Demand Requests Chip */}
        <Link
          href="/admin/coverage"
          className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              {t("demandRequests")}
            </span>
          </div>
          {demandCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {demandCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
