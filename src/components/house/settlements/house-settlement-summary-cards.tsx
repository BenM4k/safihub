import { getTranslations } from "next-intl/server";
import { CircleDollarSign, Percent, Receipt, Wallet } from "lucide-react";

interface HouseSettlementSummaryCardsProps {
  balanceOwedCDF: number;
  totalRevenueCDF: number;
  totalCommissionCDF: number;
  totalSettledCDF: number;
}

export async function HouseSettlementSummaryCards({
  balanceOwedCDF,
  totalRevenueCDF,
  totalCommissionCDF,
  totalSettledCDF,
}: HouseSettlementSummaryCardsProps) {
  const t = await getTranslations("house.settlements");

  const cards = [
    {
      label: t("balanceOwed"),
      value: `${balanceOwedCDF.toLocaleString()} CDF`,
      icon: Wallet,
      color: "text-violet-600 bg-violet-50 border-violet-200",
      highlight: balanceOwedCDF > 0,
    },
    {
      label: t("totalSettled"),
      value: `${totalSettledCDF.toLocaleString()} CDF`,
      icon: Receipt,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      highlight: false,
    },
    {
      label: t("totalRevenue"),
      value: `${totalRevenueCDF.toLocaleString()} CDF`,
      icon: CircleDollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      highlight: false,
    },
    {
      label: t("commissionDeducted"),
      value: `${totalCommissionCDF.toLocaleString()} CDF`,
      icon: Percent,
      color: "text-slate-600 bg-slate-50 border-slate-200",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 bg-white rounded-xl border border-border shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-2xs font-semibold text-muted-foreground line-clamp-1">
                {c.label}
              </span>
              <div className={`size-8 rounded-lg flex items-center justify-center border ${c.color}`}>
                <Icon className="size-4" />
              </div>
            </div>
            <div className="text-lg font-black text-heading tracking-tight">
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
