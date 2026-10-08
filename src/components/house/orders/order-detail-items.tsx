import { Package, AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { OrderItemRecord } from "@/dal";

export async function OrderDetailItems({
  items,
}: {
  items: OrderItemRecord[];
}) {
  const t = await getTranslations("house.orders");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
          <Package className="size-4 text-violet-600" />
          <span>{t("itemsList")} ({items.length})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Article</th>
              <th className="py-3 px-4">Matière</th>
              <th className="py-3 px-4 text-center">Déclaré</th>
              <th className="py-3 px-4 text-center">Reçu</th>
              <th className="py-3 px-4 text-right">Prix unit.</th>
              <th className="py-3 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {item.itemNameFr ?? item.customLabel ?? "Article"}
                  {item.conditionNote && (
                    <span className="block text-[11px] text-amber-600 font-normal mt-0.5">
                      Note: {item.conditionNote}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {item.fabricNameFr ?? "Standard"}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-800">
                  {item.declaredQuantity}
                </td>
                <td className="py-3 px-4 text-center font-bold">
                  {item.receivedQuantity !== null ? (
                    <span
                      className={
                        item.receivedQuantity !== item.declaredQuantity
                          ? "text-amber-600 underline font-extrabold"
                          : "text-slate-900"
                      }
                    >
                      {item.receivedQuantity}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-700">
                  {item.unitPrice.toLocaleString()} CDF
                </td>
                <td className="py-3 px-4 text-center">
                  {item.status === "returned" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="size-3" />
                      Exclu / Retour
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                      Accepté
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
