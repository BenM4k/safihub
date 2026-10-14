"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag, ChevronRight, RefreshCw, CheckCircle2 } from "lucide-react";

export interface DashboardOrderItem {
  id: string;
  code: string;
  customerName: string;
  houseName: string;
  courierName: string;
  status: string;
  totalDueCDF: number;
  timeAgo: string;
}

export function RecentOrdersTable({
  orders,
  title,
  subtitle,
}: {
  orders: DashboardOrderItem[];
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "delivered">("all");

  const filtered = orders.filter((o) => {
    if (activeTab === "delivered") return o.status === "delivered";
    if (activeTab === "active") return o.status !== "delivered" && o.status !== "cancelled";
    return true;
  });

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-300">
          <div>
            <h3 className="text-lg font-semibold leading-6 text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200">
            {(["all", "active", "delivered"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "all"
                  ? t("recentOrdersAll")
                  : tab === "active"
                  ? t("recentOrdersInProgress")
                  : t("recentOrdersDelivered")}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-300 shadow-xs">
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-900">{t("recentOrdersEmptyTitle")}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t("recentOrdersEmptySubtitle")}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-300">
                <tr className="font-semibold text-slate-600">
                  <th className="py-2.5 px-3">{t("recentOrdersColOrder")}</th>
                  <th className="py-2.5 px-3">{t("recentOrdersColCustomer")}</th>
                  <th className="py-2.5 px-3">{t("recentOrdersColHouse")}</th>
                  <th className="py-2.5 px-3">{t("recentOrdersColCourier")}</th>
                  <th className="py-2.5 px-3">{t("recentOrdersColStatus")}</th>
                  <th className="py-2.5 px-3 text-right">{t("recentOrdersColAmount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-indigo-600">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.code}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">{order.customerName}</td>
                    <td className="py-3 px-3 text-slate-600">{order.houseName}</td>
                    <td className="py-3 px-3 text-slate-600">{order.courierName}</td>
                    <td className="py-3 px-3">
                      {order.status === "delivered" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t("recentOrdersDelivered")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <RefreshCw className="w-3 h-3 text-indigo-600" />
                          <span>{t("recentOrdersInProgress")}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      <div>CDF {order.totalDueCDF.toLocaleString(locale)}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{order.timeAgo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500">
        <span>{t("recentOrdersShowingCount", { count: filtered.length })}</span>
        <Link href="/admin/orders" className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
          <span>{t("recentOrdersViewAll")}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
