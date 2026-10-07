"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, MapPin, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tNav = useTranslations("nav");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary-soft selection:text-primary">
      <Navbar variant="solid" />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6 min-h-screen">
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
            <span className="font-display font-black text-7xl sm:text-9xl tracking-tighter text-slate-100 block">
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

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
            {t("description")}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-12">
            <Button
              asChild
              variant="contrast"
              size="pill"
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
            >
              <Link href="/#catalogue">
                <Search className="size-4 mr-2" />
                {tNav("pricing")}
              </Link>
            </Button>
          </div>


          {/* Helpful quick guide card */}
          <div className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
            <div className="flex items-center gap-2 mb-3 font-bold text-heading text-xs sm:text-sm">
              <MapPin className="size-4 text-primary" />
              <span>Raccourcis utiles à Bukavu</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 font-medium">
              <Link
                href="/#services"
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center"
              >
                Prestations de pressing
              </Link>
              <Link
                href="/#zones"
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center"
              >
                Communes desservies
              </Link>
              <Link
                href="/terms"
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary transition-colors text-center"
              >
                Conditions & Garanties
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
