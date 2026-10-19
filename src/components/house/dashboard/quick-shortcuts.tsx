import Link from "next/link";
import { Package, Layers, Clock, Sliders, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function QuickShortcuts({ houseSlug }: { houseSlug?: string }) {
  const t = await getTranslations("house.dashboard");
  const base = houseSlug ? `/partner/${houseSlug}` : "/partner";

  const shortcuts = [
    {
      href: `${base}/orders`,
      title: t("viewOrders"),
      desc: "Voir toutes les commandes du pressing",
      icon: Package,
      color: "bg-primary-soft text-primary border-primary/20",
    },
    {
      href: `${base}/catalogue`,
      title: t("manageCatalogue"),
      desc: "Modifier les tarifs et disponibilités",
      icon: Layers,
      color: "bg-secondary text-heading border-border",
    },
    {
      href: `${base}/hours`,
      title: t("configureHours"),
      desc: "Ajuster les heures et fermetures",
      icon: Clock,
      color: "bg-warning-soft text-warning border-warning/20",
    },
    {
      href: `${base}/settings`,
      title: "Paramètres & Exclusions",
      desc: "Capacité, pause et exclusions",
      icon: Sliders,
      color: "bg-success-soft text-success border-success/20",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-heading uppercase tracking-wider">
        {t("quickActions")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 bg-card rounded-2xl border border-border hover:border-border-strong hover:shadow-xs transition group flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center border mb-2 ${item.color}`}
                >
                  <Icon className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-heading group-hover:text-primary transition">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.desc}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
