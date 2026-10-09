"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Award, Calendar } from "lucide-react";
import type { CourierHistoryData } from "@/dal";
import { Badge } from "@/components/ui/badge";

interface HistoryListViewProps {
  data: CourierHistoryData;
}

export function HistoryListView({ data }: HistoryListViewProps) {
  const t = useTranslations("courier.history");
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all");

  const filteredMissions = data.missions.filter((m) => {
    if (filter === "completed") return m.status === "completed";
    if (filter === "failed") return m.status === "failed";
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Earnings Summary Banner */}
      <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold">
          <Award className="size-4" />
          <span>{t("totalEarnings")}</span>
        </div>

        <div>
          <span className="text-3xl font-black font-mono tracking-tight">
            {data.totalEarningsCDF.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-blue-200 ml-1.5">CDF</span>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-300" />
            <span>
              {data.completedCount} {t("completedMissions")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="size-3.5 text-rose-300" />
            <span>
              {data.failedCount} {t("failedMissions")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            filter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
          }`}
        >
          {t("filterAll", { count: data.missions.length })}
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            filter === "completed" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          {t("filterCompleted", { count: data.completedCount })}
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
            filter === "failed" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-600"
          }`}
        >
          {t("filterFailed", { count: data.failedCount })}
        </button>
      </div>

      {/* Missions List */}
      {filteredMissions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredMissions.map((m) => {
            const isCompleted = m.status === "completed";
            const dateStr = new Date(m.slotStart).toLocaleDateString([], {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <div
                key={m.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      #{m.orderCode}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        m.type === "pickup"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {m.type === "pickup" ? t("pickup") : t("delivery")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-slate-400" />
                      <span>{dateStr}</span>
                    </span>
                    <span>•</span>
                    <span>{m.customerNeighborhood}</span>
                  </div>

                  {m.failureReason && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {t("reasonPrefix")} : {m.failureReason}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {isCompleted ? (
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      +{(m.courierPay ?? 0).toLocaleString()} CDF
                    </span>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                    >
                      {t("failedBadge")}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
