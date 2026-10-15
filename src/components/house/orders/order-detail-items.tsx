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
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-sm sm:text-base text-heading flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <span>{t("itemsList")} ({items.length})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface text-muted-foreground font-semibold border-b border-border">
            <tr>
              <th className="py-3 px-4">Article</th>
              <th className="py-3 px-4">Matière</th>
              <th className="py-3 px-4 text-center">Déclaré</th>
              <th className="py-3 px-4 text-center">Reçu</th>
              <th className="py-3 px-4 text-right">Prix unit.</th>
              <th className="py-3 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-surface">
                <td className="py-3 px-4 font-semibold text-heading">
                  {item.itemNameFr ?? item.customLabel ?? "Article"}
                  {item.conditionNote && (
                    <span className="block text-[11px] text-warning font-normal mt-0.5">
                      Note: {item.conditionNote}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {item.fabricNameFr ?? "Standard"}
                </td>
                <td className="py-3 px-4 text-center font-bold text-heading">
                  {item.declaredQuantity}
                </td>
                <td className="py-3 px-4 text-center font-bold">
                  {item.receivedQuantity !== null ? (
                    <span
                      className={
                        item.receivedQuantity !== item.declaredQuantity
                          ? "text-warning underline font-extrabold"
                          : "text-heading"
                      }
                    >
                      {item.receivedQuantity}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-normal">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-medium text-foreground">
                  {item.unitPrice.toLocaleString()} CDF
                </td>
                <td className="py-3 px-4 text-center">
                  {item.status === "returned" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-destructive-soft text-destructive border border-destructive/20">
                      <AlertCircle className="size-3" />
                      Exclu / Retour
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-soft text-success">
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
