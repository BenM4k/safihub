import Link from "next/link";
import { Package, Layers, Clock, Sliders, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function QuickShortcuts() {
  const t = await getTranslations("house.dashboard");

  const shortcuts = [
    {
      href: "/house/orders",
      title: t("viewOrders"),
      desc: "Voir toutes les commandes de l'atelier",
      icon: Package,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      href: "/house/catalogue",
      title: t("manageCatalogue"),
      desc: "Modifier les tarifs et disponibilités",
      icon: Layers,
      color: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      href: "/house/hours",
      title: t("configureHours"),
      desc: "Ajuster les heures et fermetures",
      icon: Clock,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      href: "/house/settings",
      title: "Paramètres & Exclusions",
      desc: "Capacité, pause et exclusions",
      icon: Sliders,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
        {t("quickActions")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-xs transition group flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center border mb-2 ${item.color}`}
                >
                  <Icon className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{item.desc}</p>
              </div>
              <ArrowRight className="size-4 text-slate-300 group-hover:text-violet-600 transition shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
