import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlusCircle } from "lucide-react";
import { listAdminOrders } from "@/services/admin";
import { OrdersTable } from "@/components/admin/orders/orders-table";

export default async function AdminOrdersPage() {
  const t = await getTranslations("admin.orders");
  const res = await listAdminOrders({ limit: 100 });
  const orders = res.ok ? res.value : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="size-4" />
          <span>{t("newOrderBtn")}</span>
        </Link>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
