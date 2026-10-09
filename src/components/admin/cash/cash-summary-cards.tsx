import { getTranslations } from "next-intl/server";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

interface CashSummaryCardsProps {
  summary: {
    totalExpectedCDF: number;
    totalReceivedCDF: number;
    totalDiscrepancyCDF: number;
  };
}

export async function CashSummaryCards({ summary }: CashSummaryCardsProps) {
  const t = await getTranslations("admin.cash");

  const cards = [
    {
      label: t("totalExpected"),
      value: `${summary.totalExpectedCDF.toLocaleString()} CDF`,
      icon: ArrowDownLeft,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: t("totalReceived"),
      value: `${summary.totalReceivedCDF.toLocaleString()} CDF`,
      icon: ArrowUpRight,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: t("totalDiscrepancy"),
      value: `${summary.totalDiscrepancyCDF > 0 ? "+" : ""}${summary.totalDiscrepancyCDF.toLocaleString()} CDF`,
      icon: Scale,
      color:
        summary.totalDiscrepancyCDF < 0
          ? "text-rose-600 bg-rose-50 border-rose-200"
          : summary.totalDiscrepancyCDF > 0
          ? "text-amber-600 bg-amber-50 border-amber-200"
          : "text-slate-600 bg-slate-50 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="p-4 bg-white rounded-xl border border-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
              <p className="text-xl font-black text-heading mt-1">{card.value}</p>
            </div>
            <div className={`size-10 rounded-lg flex items-center justify-center border ${card.color}`}>
              <Icon className="size-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
