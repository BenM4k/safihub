import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BatteryCharging, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardCourierItem {
  id: string;
  name: string;
  zone: string;
  status: "delivering" | "picking_up" | "available" | "offline";
  missionDescription: string;
  cashHeldCDF?: number;
  cashCeilingCDF: number;
  batteryPercent?: number;
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
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const activeCount = couriers.filter((c) => c.status === "available").length;

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold leading-6 text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
            {activeCount} {t("courierActive")}
          </span>
        </div>

        <div className="divide-y divide-border mt-2">
          {couriers.map((courier) => (
            <div key={courier.id} className="py-3 hover:bg-muted/30 rounded-lg px-2 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{courier.name}</span>
                    <span
                      className={`size-2 rounded-full ${
                        courier.status === "available"
                          ? "bg-emerald-500"
                          : courier.status === "delivering" || courier.status === "picking_up"
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground block">{courier.zone}</span>
                </div>

                {courier.batteryPercent !== undefined && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <BatteryCharging className="size-3.5 text-muted-foreground" />
                    <span>{courier.batteryPercent}%</span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-foreground bg-muted/40 p-2 rounded-lg border border-border shadow-2xs flex items-center justify-between">
                <span className="truncate pr-2">{courier.missionDescription}</span>
                {courier.cashHeldCDF !== undefined && (
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {t("courierCodLabel", {
                      amount: courier.cashHeldCDF.toLocaleString(locale),
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-border">
        <Button asChild variant="outline" size="sm" className="w-full gap-1.5 font-medium">
          <Link href="/admin/dispatch">
            <Send className="size-3.5" />
            <span>{t("openLiveDispatchMap")}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

