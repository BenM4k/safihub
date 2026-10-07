"use client";

import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { SAMPLE_FAQS } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-2");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-white overflow-hidden">
      <div className="container-page flex flex-col items-center">
        {/* Title matching reference faqs.png */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-12 tracking-tight">
          Questions fréquemment posées
        </h2>

        {/* Clean Accordion List matching reference */}
        <div className="w-full max-w-4xl lg:max-w-5xl space-y-4 mb-10">
          {SAMPLE_FAQS.map((faq) => {
            const isOpen = openId === faq.id;

            if (isOpen) {
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-md transition-all animate-fade-in"
                >
                  <button
                    type="button"
                    onClick={() => toggle(faq.id)}
                    className="w-full text-left flex items-start justify-between gap-4 font-display font-bold text-base sm:text-lg text-heading cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <X className="size-5 text-slate-500 shrink-0 mt-0.5 hover:text-heading" />
                  </button>
                  <p className="pt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={faq.id}
                className="border-b border-slate-200 py-4.5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg text-heading hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <Plus className="size-5 text-slate-400 shrink-0" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Centered Blue Button (from faqs.png) */}
        <div className="mb-14">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="px-8 shadow-sm"
          >
            Voir toutes les FAQ
          </Button>
        </div>

        {/* Get in touch soft container preview (from bottom of faqs.png) */}
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl bg-[#E5E2FE]/60 border border-indigo-100 p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-heading">
              Prenez contact avec notre équipe
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Une question spécifique pour votre hôtel ou votre linge ? Réponse en moins de 15 min.
            </p>
          </div>

          <Button asChild variant="contrast" size="default" className="shrink-0">
            <a
              href="https://wa.me/243999000123"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Assistance WhatsApp</span>
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
