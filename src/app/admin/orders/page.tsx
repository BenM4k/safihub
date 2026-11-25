import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlusCircle } from "lucide-react";
import { guardAdminRoute } from "@/services/auth";
import { parseAdminOrdersSearchParams } from "@/lib/admin-orders-query";
import { Button } from "@/components/ui/button";
import { OrdersStreamContent } from "@/components/admin/orders/orders-stream-content";
import { OrdersStreamSkeleton } from "@/components/admin/orders/orders-stream-skeleton";

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const [, rawSearchParams, t] = await Promise.all([
    guardAdminRoute(),
    searchParams,
    getTranslations("admin.orders"),
  ]);

  const query = parseAdminOrdersSearchParams(rawSearchParams);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Immediate Header Shell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 animate-enter">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading font-display">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <Button
          asChild
          size="sm"
          className="self-start sm:self-auto bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs px-4 min-h-11 gap-2 shadow-sm hover:shadow-md transition-all press cursor-pointer"
        >
          <Link href="/admin/orders/new">
            <PlusCircle className="size-4" />
            <span>{t("newOrderBtn")}</span>
          </Link>
        </Button>
      </div>

      {/* 2. Streamed Server-Paginated Orders Table & Filters */}
      <Suspense fallback={<OrdersStreamSkeleton />}>
        <OrdersStreamContent query={query} />
      </Suspense>
    </div>
  );
}
