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
import { Button } from "@/components/ui/button";

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
      <div className="bg-amber-500/10 border-l-4 border-l-amber-500 border border-amber-500/20 rounded-xl p-5 sm:p-6 transition-shadow hover:shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock className="size-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t("urgentAttentionTitle")}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  {pendingCount}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mt-0.5">
                {t("pendingAcceptance")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                {t("pendingAcceptanceDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <Button asChild className="gap-2 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 font-semibold shadow-xs">
              <Link href="/admin/dispatch">
                <span>{t("reviewPendingOrders", { count: pendingCount })}</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Compact Row of Stat Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Unassigned Missions Chip */}
        <Link
          href="/admin/dispatch"
          className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Send className="size-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {t("unassignedMissions")}
            </span>
          </div>
          {unassignedCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              {unassignedCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>

        {/* Open Disputes Chip */}
        <Link
          href="/admin/disputes"
          className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {t("openDisputes")}
            </span>
          </div>
          {disputesCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
              {disputesCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>

        {/* Demand Requests Chip */}
        <Link
          href="/admin/coverage"
          className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-muted/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {t("demandRequests")}
            </span>
          </div>
          {demandCount > 0 ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {demandCount}
            </span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>0 · {t("allClear")}</span>
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}

