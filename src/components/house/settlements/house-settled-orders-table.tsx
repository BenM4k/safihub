import { getTranslations } from "next-intl/server";

interface SettledOrder {
  id: string;
  code: string;
  itemsTotal: number;
  commissionAmount: number;
  owedToHouse: number;
  deliveredAt: Date | null;
}

interface HouseSettledOrdersTableProps {
  orders: SettledOrder[];
}

export async function HouseSettledOrdersTable({ orders }: HouseSettledOrdersTableProps) {
  const t = await getTranslations("house.settlements");

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold text-heading">{t("ordersDetailTitle")}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-2.5 px-4">{t("orderCode")}</th>
              <th className="py-2.5 px-4">{t("deliveredAt")}</th>
              <th className="py-2.5 px-4">{t("itemsTotal")}</th>
              <th className="py-2.5 px-4">{t("commission")}</th>
              <th className="py-2.5 px-4 text-right">{t("netOwed")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  {t("noOrders")}
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-mono font-bold text-heading">
                    {o.code}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-2xs">
                    {o.deliveredAt
                      ? new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(o.deliveredAt))
                      : "—"}
                  </td>
                  <td className="py-2.5 px-4">{o.itemsTotal.toLocaleString()} CDF</td>
                  <td className="py-2.5 px-4 text-muted-foreground">
                    -{o.commissionAmount.toLocaleString()} CDF
                  </td>
                  <td className="py-2.5 px-4 font-bold text-violet-700 text-right">
                    {o.owedToHouse.toLocaleString()} CDF
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
