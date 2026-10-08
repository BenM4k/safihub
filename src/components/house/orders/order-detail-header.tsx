import { Shield, MapPin, User, Calendar, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { HouseOrderDetailRecord } from "@/dal";
import { AcceptanceTimer } from "../dashboard/acceptance-timer";
import { OrderActions } from "./order-actions";

export async function OrderDetailHeader({
  order,
}: {
  order: HouseOrderDetailRecord;
}) {
  const t = await getTranslations("house.orders");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {order.code}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
              {order.status}
            </span>
            {order.status === "created" && (
              <AcceptanceTimer deadline={order.acceptanceDeadlineAt} />
            )}
          </div>
          <p className="text-xs text-slate-500">
            Créée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {order.status === "created" && (
          <OrderActions orderId={order.id} currentStatus={order.status} />
        )}
      </div>

      {/* AC 15 Privacy Shield Notice */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
        <Shield className="size-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600">
          <strong className="text-slate-800 font-semibold">{t("privacyBadge")} :</strong>{" "}
          {t("privacyNotice")}
        </div>
      </div>

      {/* Customer summary (Restricted projection) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
            <User className="size-3" /> {t("customerPseudonym")}
          </span>
          <strong className="text-slate-800 font-bold text-sm">
            {order.customerFirstName}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
            <MapPin className="size-3" /> {t("neighborhood")}
          </span>
          <strong className="text-slate-800 font-bold text-sm">
            {order.neighborhoodName ?? "Bukavu"}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
            <Calendar className="size-3" /> {t("pickupSlot")}
          </span>
          <strong className="text-slate-800 font-semibold">
            {new Date(order.pickupSlotStart).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </strong>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
            <Clock className="size-3" /> {t("amount")}
          </span>
          <strong className="text-emerald-700 font-bold text-sm">
            {order.totalDue.toLocaleString()} {order.currency}
          </strong>
        </div>
      </div>
    </div>
  );
}
