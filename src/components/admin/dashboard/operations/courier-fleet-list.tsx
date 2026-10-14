import Link from "next/link";
import { BatteryCharging, Send } from "lucide-react";

export interface DashboardCourierItem {
  id: string;
  name: string;
  zone: string;
  status: "delivering" | "picking_up" | "available" | "offline";
  missionDescription: string;
  cashHeldCDF: number;
  cashCeilingCDF: number;
  batteryPercent: number;
}

export function CourierFleetList({
  couriers,
  title,
  subtitle,
}: {
  couriers: DashboardCourierItem[];
  title: string;
  subtitle: string;
}) {
  const activeCount = couriers.filter((c) => c.status !== "offline").length;

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-300">
          <div>
            <h3 className="text-lg font-semibold leading-6 text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            {activeCount} active
          </span>
        </div>

        <div className="divide-y divide-slate-200 mt-2">
          {couriers.map((courier) => (
            <div key={courier.id} className="py-3 hover:bg-slate-50/75 rounded-lg px-2 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{courier.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        courier.status === "available"
                          ? "bg-emerald-500"
                          : courier.status === "delivering" || courier.status === "picking_up"
                          ? "bg-indigo-500"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block">{courier.zone}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <BatteryCharging className="w-3.5 h-3.5 text-slate-400" />
                  <span>{courier.batteryPercent}%</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-300 shadow-2xs flex items-center justify-between">
                <span className="truncate pr-2">{courier.missionDescription}</span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  COD: CDF {courier.cashHeldCDF.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-300">
        <Link
          href="/admin/dispatch"
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs hover:shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Open live dispatch map</span>
        </Link>
      </div>
    </div>
  );
}
