"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { TABS } from "./services-tabs-data";
import { getRoleCta } from "@/lib/role-cta";
import type { AuthenticatedUser } from "@/services/auth/guards";

export function ServicesTabs({ user }: { user?: AuthenticatedUser | null } = {}) {
  const [activeTabId, setActiveTabId] = useState("daily");
  const activeTab = TABS.find((t) => t.id === activeTabId) ?? TABS[0];
  const tHero = useTranslations("hero");

  const cta = getRoleCta(user);
  const ctaLabel =
    cta.roleKey === "admin"
      ? tHero("ctaAdmin")
      : cta.roleKey === "courier"
        ? tHero("ctaCourier")
        : cta.roleKey === "house"
          ? tHero("ctaHouse")
          : tHero("ctaOrder");

  return (
    <section
      id="services"
      className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-background overflow-hidden"
    >
      <div className="container-page flex flex-col items-center">
        {/* Section title matching reference Use Legitify for */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-8 tracking-tight">
          Utilisez SafiHub pour
        </h2>

        <Tabs
          value={activeTabId}
          onValueChange={(val: string) => setActiveTabId(val)}
          className="w-full flex flex-col items-center"
        >
          {/* Tab Capsule Bar (black pill when active in light, primary in dark) */}
          <TabsList className="h-auto flex flex-wrap items-center justify-center border border-border rounded-full p-1.5 mb-14 sm:mb-18 bg-card shadow-xs max-w-4xl">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-auto border-0 shadow-none after:hidden px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer text-muted-foreground hover:text-heading data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white data-[state=active]:shadow-xs"
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content container strictly matching the selected tab */}
          <TabsContent
            key={activeTab.id}
            value={activeTab.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full max-w-6xl animate-fade-in"
          >
            {/* Left: Text and bullet points */}
            <div className="lg:col-span-6 stack gap-5 text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading">
                {activeTab.title}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                {activeTab.description}
              </p>

              <ul className="space-y-2.5 text-sm text-heading font-medium">
                {activeTab.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3">
                <Link
                  href={cta.href}
                  className="bg-primary hover:bg-primary-hover text-white text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all group"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right: Overlapping image on tinted curved container (from how-it-works.png) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xl aspect-4/3 flex items-center justify-end">
                {/* Background colored curved backplate matching selected tab tint */}
                <div
                  className={`absolute inset-0 rounded-4xl ${activeTab.bgTint} transition-colors duration-300 p-4`}
                >
                  <div className="size-8 rounded-lg bg-card/80 border border-border/60 flex items-center justify-center text-primary">
                    <Shirt className="size-4" />
                  </div>
                </div>

                {/* Overlapping foreground photo */}
                <div className="relative w-[85%] h-[90%] rounded-2xl overflow-hidden shadow-md border border-border z-10 mr-[-2%]">
                  <Image
                    src={activeTab.imageUrl}
                    alt={activeTab.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
