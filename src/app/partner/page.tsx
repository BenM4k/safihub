import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2, ArrowRight, Store, Shield } from "lucide-react";
import { guardHouseRoute } from "@/services/auth";
import { getHouses } from "@/dal";

export const metadata = {
  title: "Espace Partenaire — SafiHub",
  description: "Sélectionnez votre atelier de pressing pour accéder à votre tableau de bord.",
};

export default async function PartnerChooserPage() {
  const authCtx = await guardHouseRoute();
  const t = await getTranslations("house.chooser");

  // If house user with exactly one membership, redirect immediately
  if (authCtx.user.role === "house" && authCtx.memberships && authCtx.memberships.length === 1) {
    redirect(`/partner/${authCtx.memberships[0].houseSlug}`);
  }

  // If house user with multiple memberships
  if (authCtx.user.role === "house" && authCtx.memberships && authCtx.memberships.length > 1) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-sm">
              <Store className="size-6" />
            </div>
            <h1 className="text-2xl font-bold text-heading">{t("selectHouseTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("selectHouseSubtitle")}</p>
          </div>

          <div className="grid gap-3">
            {authCtx.memberships.map((m) => (
              <Link
                key={m.houseId}
                href={`/partner/${m.houseSlug}`}
                className="p-5 rounded-2xl bg-card border border-border hover:border-border-strong hover:shadow-xs transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-heading group-hover:text-primary transition">
                      {m.houseName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {m.isActive ? t("statusActive") : t("statusInactive")}
                      {m.isPaused ? ` · ${t("statusPaused")}` : ""}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If admin user, show all houses with admin-view access
  if (authCtx.user.role === "admin") {
    const allHouses = await getHouses();

    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning-soft text-warning text-xs font-bold border border-warning/20">
              <Shield className="size-3.5" />
              <span>{t("adminMode")}</span>
            </div>
            <h1 className="text-2xl font-black text-heading tracking-tight">
              {t("adminTitle")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("adminSubtitle")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {allHouses.map((h) => (
              <Link
                key={h.id}
                href={`/partner/${h.slug}`}
                className="p-4 rounded-xl bg-card border border-border hover:border-border-strong hover:shadow-xs transition group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                    <Store className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-heading group-hover:text-primary transition">
                      {h.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      slug: <span className="font-mono text-muted-foreground">{h.slug}</span>
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default empty state if no memberships assigned
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-4">
        <Store className="size-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-bold text-heading">{t("noHouseTitle")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("noHouseMessage")}
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
