import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Send,
  MapPin,
  Building2,
  Sliders,
  Layers,
  Wallet,
  ChevronRight,
} from "lucide-react";

export async function QuickActions() {
  const t = await getTranslations("admin.dashboard");

  const actions = [
    {
      id: "dispatch",
      title: t("dispatchTitle"),
      desc: t("dispatchDesc"),
      href: "/admin/dispatch",
      icon: Send,
    },
    {
      id: "coverage",
      title: t("coverageTitle"),
      desc: t("coverageDesc"),
      href: "/admin/coverage",
      icon: MapPin,
    },
    {
      id: "houses",
      title: t("housesTitle"),
      desc: t("housesDesc"),
      href: "/admin/houses",
      icon: Building2,
    },
    {
      id: "catalogue",
      title: t("catalogueTitle"),
      desc: t("catalogueDesc"),
      href: "/admin/catalogue",
      icon: Layers,
    },
    {
      id: "cash",
      title: t("cashReconciliationTitle"),
      desc: t("cashReconciliationDesc"),
      href: "/admin/cash",
      icon: Wallet,
    },
    {
      id: "settings",
      title: t("settingsTitle"),
      desc: t("settingsDesc"),
      href: "/admin/settings",
      icon: Sliders,
    },
  ];

  return (
    <section aria-labelledby="shortcuts-heading" className="space-y-3">
      <h2 id="shortcuts-heading" className="text-base font-semibold leading-6 text-foreground">
        {t("quickShortcuts")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              className="p-5 rounded-xl bg-card border border-border shadow-xs hover:bg-muted/40 transition-colors group flex items-start gap-4 cursor-pointer"
            >
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {act.title}
                  </h3>
                  <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {act.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

