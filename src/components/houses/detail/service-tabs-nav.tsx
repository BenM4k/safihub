"use client";

import { useTranslations } from "next-intl";

interface ServiceTabsNavProps {
  services: Array<{ id: string; slug: string; nameFr: string; nameSw: string }>;
  activeServiceSlug: string | null;
  onSelectService: (slug: string | null) => void;
}

export function ServiceTabsNav({
  services,
  activeServiceSlug,
  onSelectService,
}: ServiceTabsNavProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 sticky top-20 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectService(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
            activeServiceSlug === null
              ? "bg-slate-900 text-white shadow-2xs"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
          }`}
        >
          {t("allServicesTab")}
        </button>

        {services.map((svc) => {
          const isActive = activeServiceSlug === svc.slug;
          return (
            <button
              key={svc.slug}
              type="button"
              onClick={() => onSelectService(svc.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {svc.nameFr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
