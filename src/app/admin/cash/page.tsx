import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DateNavigator } from "@/components/admin/shared/date-navigator";
import { CashDailyStream } from "@/components/admin/cash/cash-daily-stream";
import { CashHistoryStream } from "@/components/admin/cash/cash-history-stream";
import {
  CashHistorySkeleton,
  CashLoadingSkeleton,
} from "@/components/admin/cash/cash-loading-skeleton";

interface AdminCashPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function AdminCashPage({ searchParams }: AdminCashPageProps) {
  const [, params, t] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin.cash"),
  ]);

  const todayLubumbashi = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lubumbashi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const selectedDate =
    params.date &&
    /^\d{4}-\d{2}-\d{2}$/.test(params.date) &&
    params.date <= todayLubumbashi
      ? params.date
      : todayLubumbashi;

  return (
    <div className="space-y-6">
      <div className="animate-enter">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actions={
            <DateNavigator
              currentDate={selectedDate}
              maxDate={todayLubumbashi}
            />
          }
        />
      </div>

      <Suspense fallback={<CashLoadingSkeleton />}>
        <CashDailyStream selectedDate={selectedDate} />
      </Suspense>

      <Suspense fallback={<CashHistorySkeleton />}>
        <CashHistoryStream />
      </Suspense>
    </div>
  );
}
