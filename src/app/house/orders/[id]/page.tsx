import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";
import { getHouseOrderDetail } from "@/services/house";
import { OrderDetailHeader } from "@/components/house/orders/order-detail-header";
import { OrderDetailItems } from "@/components/house/orders/order-detail-items";
import { ReceptionCountForm } from "@/components/house/orders/reception-count-form";
import { MarkReadyButton } from "@/components/house/orders/mark-ready-button";

export default async function HouseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authCtx = await guardHouseRoute();
  let houseId = authCtx.houseId || authCtx.primaryHouseId;

  if (!houseId && authCtx.isAdminOverride) {
    const allHouses = await getHouses();
    if (allHouses.length > 0) {
      houseId = allHouses[0].id;
    }
  }

  if (!houseId) {
    notFound();
  }

  const detailRes = await getHouseOrderDetail(houseId, id);

  if (!detailRes.ok) {
    notFound();
  }

  const { order, items } = detailRes.value;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/house/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="size-3.5" />
          <span>Retour aux commandes</span>
        </Link>
      </div>

      {/* Header with status, customer first name, and AC 15 privacy badge */}
      <OrderDetailHeader order={order} />

      {/* Reception Count Form (when received) */}
      {order.status === "received" && (
        <ReceptionCountForm orderId={order.id} houseId={houseId} items={items} />
      )}

      {/* Mark as Ready button (when washing) */}
      {order.status === "washing" && (
        <MarkReadyButton orderId={order.id} houseId={houseId} />
      )}

      {/* Order Items Table */}
      <OrderDetailItems items={items} />
    </div>
  );
}
