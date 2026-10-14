import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Store,
  ShoppingBag,
  Shirt,
  Package,
  Handshake,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/services/auth";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function NotFound() {
  const [t, user] = await Promise.all([
    getTranslations("notFound"),
    getCurrentUser(),
  ]);

  const destinations = [
    {
      href: "/#catalogue",
      title: t("catalogueShortcut"),
      icon: ShoppingBag,
    },
    {
      href: "/#services",
      title: t("servicesShortcut"),
      icon: Shirt,
    },
    {
      href: "/coverage",
      title: t("zonesShortcut"),
      icon: MapPin,
    },
    {
      href: "/orders",
      title: t("ordersShortcut"),
      icon: Package,
    },
    {
      href: "/partners/apply",
      title: t("partnerShortcut"),
      icon: Handshake,
    },
    {
      href: "/terms",
      title: t("termsShortcut"),
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <Navbar variant="solid" user={user} />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6">
        <div className="container-page max-w-2xl text-center flex flex-col items-center">
          {/* Status badge */}
          <Badge
            variant="outline"
            className="mb-6 px-3.5 py-1 text-xs font-semibold text-primary border-primary/25 bg-primary/5"
          >
            {t("badge")}
          </Badge>

          {/* Big graphical 404 display */}
          <div className="relative mb-6 select-none">
            <span className="font-display font-black text-7xl sm:text-9xl tracking-tighter text-slate-100 dark:text-white/10 block">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 sm:size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Sparkles className="size-8 sm:size-10 fill-primary/20" />
              </div>
            </div>
          </div>

          {/* Text message */}
          <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight text-heading mb-4">
            {t("title")}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            {t("description")}
          </p>

          {/* Primary Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-10">
            <Button
              asChild
              variant="contrast"
              size="pill"
              className="w-full sm:w-auto shadow-xs"
            >
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                {t("backHome")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="pill"
              className="w-full sm:w-auto border-border hover:border-primary/40"
            >
              <Link href="/houses">
                <Store className="size-4 mr-2 text-primary" />
                {t("browseHouses")}
              </Link>
            </Button>
          </div>

          {/* Helpful quick guide card with 6-item balanced grid */}
          <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-left mb-6">
            <div className="flex items-center gap-2 mb-4 font-bold text-heading text-xs sm:text-sm">
              <MapPin className="size-4 text-primary" />
              <span>{t("usefulShortcuts")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {destinations.map((dest) => {
                const Icon = dest.icon;
                return (
                  <Link
                    key={dest.href}
                    href={dest.href}
                    className="group flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-primary/50 hover:shadow-xs transition-all text-xs font-semibold text-heading hover:text-primary"
                  >
                    <div className="size-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="size-3.5 stroke-[2.2]" />
                    </div>
                    <span className="truncate">{dest.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Local Support contact pill */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PhoneCall className="size-3.5 text-primary shrink-0" />
            <span>
              {t("supportContact")}{" "}
              <a
                href="tel:+243999000123"
                className="font-bold text-heading hover:text-primary underline underline-offset-2 transition-colors ml-1"
              >
                +243 999 000 123
              </a>
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
