import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { getAdminOrderDetail } from "@/services/admin";
import { OrderItemsList } from "@/components/admin/orders/order-items-list";
import { OnBehalfActions } from "@/components/admin/orders/on-behalf-actions";
import { FirstOrderScreeningActions } from "@/components/admin/orders/first-order-screening-actions";
import { OrderTimeline } from "@/components/admin/orders/order-timeline";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const t = await getTranslations("admin.orders");
  const res = await getAdminOrderDetail(orderId);

  if (!res.ok || !res.value) {
    notFound();
  }

  const { order, items, events } = res.value;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex flex-col gap-1.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/orders">{t("title")}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>#{order.code}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-heading font-mono">
              {t("orderNumber", { code: order.code })}
            </h1>
            <StatusBadge tone="info" className="text-xs font-semibold px-2.5 py-0.5">
              {order.status}
            </StatusBadge>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
              {t("channel")}: {order.source}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {t("trackingToken")}: {order.trackingToken}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs border-border-strong">
            <Link href={`/track/${order.trackingToken}`} target="_blank" className="gap-1.5">
              <span>{t("clientTrackingView")}</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer card */}
        <Card className="p-4 rounded-xl border border-border bg-card shadow-xs gap-2">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              {t("customer")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-1 text-xs text-ink-600">
            <p className="text-sm font-semibold text-heading">
              {order.customerName || t("guestCustomer")}
            </p>
            <p className="font-mono text-ink-700">{order.customerPhone}</p>
            <p>
              Quartier: <span className="font-medium text-heading">{order.neighborhoodName || t("unspecified")}</span>
            </p>
            <p>{t("landmark")}: {order.landmark}</p>
          </CardContent>
        </Card>

        {/* House card */}
        <Card className="p-4 rounded-xl border border-border bg-card shadow-xs gap-2">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              {t("house")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-1.5 text-xs text-ink-600">
            <p className="text-sm font-semibold text-heading">
              {order.houseName || order.houseId}
            </p>
            <p>
              {t("pickupSlot")}:{" "}
              <span className="font-medium text-heading">
                {new Date(order.pickupSlotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(order.pickupSlotEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
            {order.deliveryConfirmationCode && (
              <p className="text-xs text-success font-mono font-bold bg-success-soft p-1.5 rounded border border-success/20">
                {t("deliveryConfirmationCode")}: {order.deliveryConfirmationCode}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Financials card */}
        <Card className="p-4 rounded-xl border border-border bg-card shadow-xs gap-2 text-xs text-ink-600">
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
              {t("financialsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span>{t("itemsTotal")}:</span>
              <span className="font-medium text-heading">
                {order.itemsTotal.toLocaleString()} {order.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("deliveryFee")}:</span>
              <span className="font-medium text-heading">
                {order.deliveryFee.toLocaleString()} {order.currency}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border font-semibold text-heading">
              <span>{t("totalDue")}:</span>
              <span className="text-primary font-bold">
                {order.totalDue.toLocaleString()} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>{t("commission", { rate: order.commissionBps / 100 })}:</span>
              <span>
                {order.commissionAmount.toLocaleString()} {order.currency}
              </span>
            </div>
            {order.exchangeRateUsed && (
              <div className="text-[11px] text-muted-foreground">
                {t("frozenRate", { rate: order.exchangeRateUsed })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main split: Items & On-behalf actions vs Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <OrderItemsList items={items} currency={order.currency} />
          {order.status === "awaiting_confirmation" ? (
            <FirstOrderScreeningActions orderId={order.id} />
          ) : (
            <OnBehalfActions order={order} />
          )}
        </div>
        <div className="lg:col-span-1">
          <OrderTimeline orderId={order.id} events={events} />
        </div>
      </div>
    </div>
  );
}
