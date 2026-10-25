"use client";

import { Plus, X, ArrowRight } from "lucide-react";
import { SAMPLE_FAQS } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FaqSection() {
  return (
    <section id="faq" className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-background overflow-hidden">
      <div className="container-page flex flex-col items-center">
        {/* Title matching reference faqs.png */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-12 tracking-tight">
          Questions fréquemment posées
        </h2>

        {/* Clean Accordion List matching reference */}
        <div className="w-full max-w-4xl lg:max-w-5xl mb-10">
          <Accordion type="single" collapsible defaultValue="faq-2" className="space-y-4">
            {SAMPLE_FAQS.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-border py-4.5 transition-colors data-[state=open]:bg-card data-[state=open]:rounded-2xl data-[state=open]:p-6 sm:data-[state=open]:p-7 data-[state=open]:border data-[state=open]:border-border data-[state=open]:shadow-md data-[state=open]:animate-fade-in data-[state=open]:border-b data-[state=open]:py-6"
              >
                <AccordionTrigger className="w-full text-left flex items-start justify-between gap-4 font-display font-bold text-base sm:text-lg text-heading hover:text-primary transition-colors cursor-pointer hover:no-underline py-0 [&>svg:last-child]:hidden group/trigger">
                  <span>{faq.question}</span>
                  <Plus className="size-5 text-muted-foreground shrink-0 group-data-[state=open]/trigger:hidden" />
                  <X className="size-5 text-muted-foreground shrink-0 hidden group-data-[state=open]/trigger:block mt-0.5 hover:text-heading" />
                </AccordionTrigger>
                <AccordionContent className="pt-3 text-sm sm:text-base text-muted-foreground leading-relaxed pb-0">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl bg-primary-soft/50 dark:bg-card border border-primary/20 dark:border-border p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-heading">
              Prenez contact avec notre équipe
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Une question spécifique pour votre hôtel ou votre linge ? Réponse en moins de 15 min.
            </p>
          </div>

          <Button asChild variant="contrast" size="default" className="shrink-0 dark:bg-primary dark:text-white dark:hover:bg-primary-hover">
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
