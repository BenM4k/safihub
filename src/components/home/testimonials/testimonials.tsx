"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { SAMPLE_TESTIMONIALS } from "@/lib/sample-data";

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    ...SAMPLE_TESTIMONIALS,
    {
      id: "test-4",
      author: "Grace Mwamini",
      role: "Architecte d'intérieur",
      neighborhood: "La Botte",
      comment:
        "Le suivi du coursier et la confirmation photo avant le départ des vêtements évitent tous les malentendus. Mes tailleurs reviennent impeccables en 24h chrono.",
      rating: 5,
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      serviceUsed: "Costumes & Chemises",
    },
    {
      id: "test-5",
      author: "David Baraka",
      role: "Entrepreneur",
      neighborhood: "Kadutu",
      comment:
        "La transparence des prix en Francs Congolais et le fait de payer en cash à la porte après inspection des habits font de SafiHub le service le plus fiable de Bukavu.",
      rating: 5,
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      serviceUsed: "Lavage Quotidien",
    },
  ];

  const current = testimonials[activeIndex];
  const prevIndex =
    (activeIndex - 1 + testimonials.length) % testimonials.length;
  const nextIndex = (activeIndex + 1) % testimonials.length;

  return (
    <section className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-white overflow-hidden">
      <div className="container-page flex flex-col items-center">
        {/* Section title matching reference */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-12 tracking-tight">
          Témoignages
        </h2>

        {/* Testimonial slider view with side peek cards */}
        <div className="relative w-full max-w-7xl flex items-center justify-center gap-5 sm:gap-6">
          {/* Left Peek Card (desktop) */}
          <div
            onClick={() => setActiveIndex(prevIndex)}
            className="hidden lg:block w-[16%] opacity-35 hover:opacity-60 transition-opacity cursor-pointer p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs scale-95 shrink-0"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="size-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 line-clamp-3">
              « {testimonials[prevIndex].comment} »
            </p>
          </div>

          {/* Active Center Card (matching reference testimonial.png) */}
          <div className="w-full lg:w-[68%] bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm flex flex-col justify-between min-h-67.5 sm:min-h-80">
            <div>
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 sm:size-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Large quote text */}
              <p className="text-base sm:text-xl font-bold text-heading leading-relaxed mb-8">
                “{current.comment}”
              </p>
            </div>

            {/* Bottom row: Author on left, Company badge on right */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative size-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={current.avatarUrl}
                    alt={current.author}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-heading leading-tight">
                    {current.author}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {current.role}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-primary bg-brand-50 px-3 py-1 rounded-full border border-indigo-100">
                {current.neighborhood}
              </span>
            </div>
          </div>

          {/* Right Peek Card (desktop) */}
          <div
            onClick={() => setActiveIndex(nextIndex)}
            className="hidden lg:block w-[18%] opacity-35 hover:opacity-60 transition-opacity cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs scale-90 shrink-0"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="size-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 line-clamp-3">
              « {testimonials[nextIndex].comment} »
            </p>
          </div>
        </div>

        {/* 5 Dots Pagination below (from testimonial.png) */}
        <div className="flex items-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Afficher témoignage ${i + 1}`}
              className={`size-2.5 rounded-full transition-all ${
                i === activeIndex
                  ? "bg-primary w-5"
                  : "bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
