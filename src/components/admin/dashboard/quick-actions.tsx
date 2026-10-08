import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlusCircle, Send, MapPin, Building2, Sliders, Layers } from "lucide-react";

export async function QuickActions() {
  const t = await getTranslations("admin.dashboard");

  const actions = [
    {
      label: "Saisie de commande manuelle",
      desc: "Créer une commande par WhatsApp ou téléphone",
      href: "/admin/orders/new",
      icon: PlusCircle,
      btnVariant: "bg-primary text-white",
    },
    {
      label: "Écran de Dispatch",
      desc: "Affecter des missions aux coursiers éligibles",
      href: "/admin/dispatch",
      icon: Send,
      btnVariant: "bg-slate-900 text-white",
    },
    {
      label: "Gestion de la couverture",
      desc: "Activer ou suspendre des quartiers",
      href: "/admin/coverage",
      icon: MapPin,
      btnVariant: "bg-slate-100 text-heading border border-border",
    },
    {
      label: "Pressings partenaires",
      desc: "Configurer commissions et horaires",
      href: "/admin/houses",
      icon: Building2,
      btnVariant: "bg-slate-100 text-heading border border-border",
    },
    {
      label: "Catalogue maître",
      desc: "Gérer articles et valider demandes",
      href: "/admin/catalogue",
      icon: Layers,
      btnVariant: "bg-slate-100 text-heading border border-border",
    },
    {
      label: "Paramètres & Taux du jour",
      desc: "Ajuster le taux USD/CDF et délais",
      href: "/admin/settings",
      icon: Sliders,
      btnVariant: "bg-slate-100 text-heading border border-border",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-xs space-y-4">
      <h2 className="text-base font-bold text-heading">
        {t("quickShortcuts")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              href={act.href}
              className="p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-slate-50/60 transition group flex items-start gap-3.5"
            >
              <div className="size-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition">
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-heading group-hover:text-primary transition">
                  {act.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {act.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
