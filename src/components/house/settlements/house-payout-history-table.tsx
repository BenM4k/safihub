import { getFormatter, getTranslations } from "next-intl/server";

interface PayoutItem {
  id: string;
  amount: number;
  currency: "CDF" | "USD";
  note: string | null;
  createdAt: Date;
}

interface HousePayoutHistoryTableProps {
  payouts: PayoutItem[];
}

export async function HousePayoutHistoryTable({ payouts }: HousePayoutHistoryTableProps) {
  const t = await getTranslations("house.settlements");
  const format = await getFormatter();

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold text-heading">{t("payoutsHistoryTitle")}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold">
              <th className="py-2.5 px-4">{t("settlementDate")}</th>
              <th className="py-2.5 px-4">{t("settlementAmount")}</th>
              <th className="py-2.5 px-4">{t("settlementRef")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                  {t("noPayouts")}
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-mono text-muted-foreground">
                    {format.dateTime(new Date(p.createdAt), {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-emerald-700">
                    +{p.amount.toLocaleString()} {p.currency}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground">
                    {p.note || t("defaultPayoutNote")}
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
