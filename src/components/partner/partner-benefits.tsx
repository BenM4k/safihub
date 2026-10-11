import { Users, Truck, WalletCards } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function PartnerBenefits() {
  const t = await getTranslations("partnerApply");

  const benefits = [
    {
      icon: Users,
      title: t("benefit1Title"),
      desc: t("benefit1Desc"),
    },
    {
      icon: Truck,
      title: t("benefit2Title"),
      desc: t("benefit2Desc"),
    },
    {
      icon: WalletCards,
      title: t("benefit3Title"),
      desc: t("benefit3Desc"),
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 stack gap-6">
      <h3 className="font-bold text-heading text-lg tracking-tight">
        {t("benefitsTitle")}
      </h3>
      <div className="stack gap-5">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-heading">{b.title}</h4>
                <p className="text-xs text-ink-600 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
