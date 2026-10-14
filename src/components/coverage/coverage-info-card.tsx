"use client";

import { useTranslations } from "next-intl";
import { MapPin, Truck, Clock, ShieldCheck } from "lucide-react";

export function CoverageInfoCard() {
  const t = useTranslations("coverage");

  const features = [
    {
      icon: Truck,
      title: t("feature1Title"),
      desc: t("feature1Desc"),
    },
    {
      icon: Clock,
      title: t("feature2Title"),
      desc: t("feature2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("feature3Title"),
      desc: t("feature3Desc"),
    },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-center space-y-8 pr-4">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit">
          <MapPin className="size-3.5" />
          <span>Bukavu • Ibanda • Kadutu • Bagira</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          {t("infoTitle")}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md">
          {t("infoDesc")}
        </p>
      </div>

      <div className="space-y-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
