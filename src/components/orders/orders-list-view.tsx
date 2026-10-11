"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { OrderListCard } from "./orders-list-card";
import type { OrderListItemRecord } from "@/dal";
import { ACTIVE_ORDER_STATUSES } from "@/services/order";
import type { OrderStatus } from "@/services/db/schema";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

interface OrdersListViewProps {
  orders: OrderListItemRecord[];
  initialTab?: "active" | "past";
}

export function OrdersListView({
  orders,
  initialTab = "active",
}: OrdersListViewProps) {
  const t = useTranslations("orders");
  const [activeTab, setActiveTab] = useState<"active" | "past">(initialTab);
  const [currentPage, setCurrentPage] = useState(1);

  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        ACTIVE_ORDER_STATUSES.includes(o.status as OrderStatus)
      ),
    [orders]
  );

  const pastOrders = useMemo(
    () =>
      orders.filter(
        (o) => !ACTIVE_ORDER_STATUSES.includes(o.status as OrderStatus)
      ),
    [orders]
  );

  const displayedList = activeTab === "active" ? activeOrders : pastOrders;
  const totalPages = Math.ceil(displayedList.length / PAGE_SIZE) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return displayedList.slice(start, start + PAGE_SIZE);
  }, [displayedList, safePage]);

  const handleTabChange = (tab: "active" | "past") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
        <div className="size-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="size-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t("emptyActive")}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          {t("empty")}
        </p>
        <Link
          href="/houses"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition shadow-sm"
        >
          <span>Découvrir les pressings</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Segmented Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange("active")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer",
            activeTab === "active"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {t("activeTab", { count: activeOrders.length })}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("past")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer",
            activeTab === "past"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {t("pastTab", { count: pastOrders.length })}
        </button>
      </div>

      {/* Orders List / Empty State */}
      {displayedList.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          {activeTab === "active" ? t("emptyActive") : t("emptyPast")}
        </div>
      ) : (
        <div className="space-y-3.5">
          {paginatedOrders.map((order) => (
            <OrderListCard
              key={order.id}
              order={order}
              isPast={activeTab === "past"}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="size-4" />
            <span>{t("previousPage")}</span>
          </button>

          <span className="text-xs font-medium text-slate-500">
            {t("pageIndicator", { page: safePage, total: totalPages })}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span>{t("nextPage")}</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
