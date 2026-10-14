"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "delivered">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const filtered = orders.filter((o) => {
    if (showEmpty) return false;
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
                {tab === "all" ? "All" : tab === "active" ? "In progress" : "Delivered"}
              </button>
            ))}
          </div>
        </div>

        {/* Developer Preview Toggles */}
        <div className="py-2 px-3 my-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-500 border border-slate-300 shadow-2xs">
          <span className="font-medium">State preview:</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isLoading}
                onChange={(e) => setIsLoading(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Skeleton</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showEmpty}
                onChange={(e) => setShowEmpty(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Empty</span>
            </label>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-300 shadow-xs">
          {isLoading ? (
            <div className="space-y-3 p-3" aria-label="Loading orders">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-2.5 border-b border-slate-200 last:border-b-0">
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-900">No orders in this view</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Orders will appear here as customers checkout</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-300">
                <tr className="font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Laundry House</th>
                  <th className="py-2.5 px-3">Courier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
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
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <RefreshCw className="w-3 h-3 text-indigo-600" />
                          <span>In progress</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-900">
                      <div>CDF {order.totalDueCDF.toLocaleString("en-US")}</div>
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
        <span>Showing {filtered.length} orders</span>
        <Link href="/admin/orders" className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
          <span>View all orders</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
