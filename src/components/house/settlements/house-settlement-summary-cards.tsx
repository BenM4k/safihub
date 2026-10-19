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
      color: "text-primary bg-primary-soft border-primary/20",
      highlight: balanceOwedCDF > 0,
    },
    {
      label: t("totalSettled"),
      value: `${totalSettledCDF.toLocaleString()} CDF`,
      icon: Receipt,
      color: "text-success bg-success-soft border-success/20",
      highlight: false,
    },
    {
      label: t("totalRevenue"),
      value: `${totalRevenueCDF.toLocaleString()} CDF`,
      icon: CircleDollarSign,
      color: "text-heading bg-secondary border-border",
      highlight: false,
    },
    {
      label: t("commissionDeducted"),
      value: `${totalCommissionCDF.toLocaleString()} CDF`,
      icon: Percent,
      color: "text-muted-foreground bg-surface border-border",
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
            className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col justify-between"
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
