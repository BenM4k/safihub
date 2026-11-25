"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag, ChevronRight, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/shared/status-badge";

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
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between animate-enter">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold leading-6 text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "all" | "active" | "delivered")}
          >
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs px-2.5">
                {t("recentOrdersAll")}
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-2.5">
                {t("recentOrdersInProgress")}
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs px-2.5">
                {t("recentOrdersDelivered")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-x-auto mt-2 rounded-lg border border-border">
          {filtered.length === 0 ? (
            <div className="py-10 text-center animate-enter-fast">
              <div className="size-10 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-2">
                <ShoppingBag className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">{t("recentOrdersEmptyTitle")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t("recentOrdersEmptySubtitle")}</p>
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="h-9 py-2 px-3 uppercase font-semibold text-foreground">{t("recentOrdersColOrder")}</TableHead>
                  <TableHead className="h-9 py-2 px-3 uppercase font-semibold text-foreground">{t("recentOrdersColCustomer")}</TableHead>
                  <TableHead className="h-9 py-2 px-3 uppercase font-semibold text-foreground">{t("recentOrdersColHouse")}</TableHead>
                  <TableHead className="h-9 py-2 px-3 uppercase font-semibold text-foreground">{t("recentOrdersColCourier")}</TableHead>
                  <TableHead className="h-9 py-2 px-3 uppercase font-semibold text-foreground">{t("recentOrdersColStatus")}</TableHead>
                  <TableHead className="h-9 py-2 px-3 text-right uppercase font-semibold text-foreground">{t("recentOrdersColAmount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="row-interactive animate-enter-fast">
                    <TableCell className="py-3 px-3 font-mono font-medium text-primary">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.code}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 px-3 font-medium text-foreground">{order.customerName}</TableCell>
                    <TableCell className="py-3 px-3 text-muted-foreground">{order.houseName}</TableCell>
                    <TableCell className="py-3 px-3 text-muted-foreground">{order.courierName}</TableCell>
                    <TableCell className="py-3 px-3">
                      {order.status === "delivered" ? (
                        <StatusBadge
                          tone="success"
                          icon={<CheckCircle2 className="size-3" />}
                          className="rounded-md"
                        >
                          {t("recentOrdersDelivered")}
                        </StatusBadge>
                      ) : (
                        <StatusBadge
                          tone="info"
                          icon={<RefreshCw className="size-3" />}
                          className="rounded-md"
                        >
                          {t("recentOrdersInProgress")}
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right font-medium tabular-nums text-foreground">
                      <div>CDF {order.totalDueCDF.toLocaleString(locale)}</div>
                      <span className="text-[10px] text-muted-foreground font-normal">{order.timeAgo}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("recentOrdersShowingCount", { count: filtered.length })}</span>
        <Link href="/admin/orders" className="font-medium text-primary hover:underline inline-flex items-center gap-1 group">
          <span>{t("recentOrdersViewAll")}</span>
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
