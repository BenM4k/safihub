"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shirt } from "lucide-react";

interface TabItem {
  id: string;
  name: string;
  title: string;
  description: string;
  bullets: string[];
  imageUrl: string;
  bgTint: string;
}

const TABS: TabItem[] = [
  {
    id: "daily",
    name: "Vêtements Quotidien",
    title: "Chemises & Tenues de tous les jours",
    description:
      "Pour vos journées de travail à Bukavu, réunions et sorties. Finition soignée au fer avec contrôle minutieux de chaque couture.",
    bullets: [
      "Détachage ciblé des cols, poignets et aisselles",
      "Repassage vapeur haute précision et cintre adapté",
      "Pliage compact sous housse pour protection poussière",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#BAE6FD]/60",
  },
  {
    id: "suits",
    name: "Costumes & Cérémonie",
    title: "Pressing d'apparat & Matières nobles",
    description:
      "Soin haute précision sans solvants corrosifs pour préserver la forme naturelle des fibres et l'éclat des couleurs.",
    bullets: [
      "Costumes en pure laine, smokings et blazers",
      "Robes de soirée, pagnes brodés et soies précieuses",
      "Livraison sur cintre ergonomique sous housse zippée",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#DDD9FE]/70",
  },
  {
    id: "bedding",
    name: "Linge de lit & Maison",
    title: "Literie, Couettes & Linge d'intérieur",
    description:
      "Machines grande capacité et désinfection thermique 60°C pour éliminer acariens et bactéries en profondeur.",
    bullets: [
      "Couettes grand format, duvets et couvertures volumineuses",
      "Draps, housses et taies calandrés au toucher d’hôtel",
      "Rideaux occultants et nappes de banquet",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#BBF7D0]/60",
  },
  {
    id: "shoes",
    name: "Baskets & Chaussures",
    title: "Restauration de Sneakers & Cuirs",
    description:
      "Brossage minutieux à la main des semelles et empeignes pour redonner une seconde jeunesse à vos paires préférées.",
    bullets: [
      "Nettoyage manuel semelles, lacets et œillets",
      "Désodorisation antibactérienne de la semelle interne",
      "Cirage et imperméabilisation protectrice",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    bgTint: "bg-[#FED7AA]/60",
  },
];

export function ServicesTabs() {
  const [activeTabId, setActiveTabId] = useState("daily");
  const activeTab = TABS.find((t) => t.id === activeTabId) ?? TABS[0];

  return (
    <section
      id="services"
      className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-white overflow-hidden"
    >
      <div className="container-page flex flex-col items-center">
        {/* Section title matching reference Use Legitify for */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-8 tracking-tight">
          Utilisez SafiHub pour
        </h2>

        {/* Tab Capsule Bar (black pill when active) */}
        <div className="flex flex-wrap items-center justify-center border border-slate-200 rounded-full p-1.5 mb-14 sm:mb-18 bg-white shadow-xs max-w-4xl">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-ink-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-heading"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content split (Left copy + Right overlapping image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full max-w-6xl">
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
                href="#catalogue"
                className="bg-primary hover:bg-primary-hover text-white text-base font-semibold px-7 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all group"
              >
                <span>Commander maintenant</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: Overlapping image on tinted curved container (from how-it-works.png) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl aspect-4/3 flex items-center justify-end">
              {/* Background colored curved backplate */}
              <div
                className={`absolute inset-0 rounded-4xl ${activeTab.bgTint} transition-colors duration-300 p-4`}
              >
                <div className="size-8 rounded-lg bg-white/70 flex items-center justify-center text-primary">
                  <Shirt className="size-4" />
                </div>
              </div>

              {/* Overlapping foreground photo */}
              <div className="relative w-[85%] h-[90%] rounded-2xl overflow-hidden shadow-md border border-white/80 z-10 mr-[-2%]">
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
        </div>
      </div>
    </section>
  );
}
