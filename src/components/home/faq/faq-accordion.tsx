"use client";

import { Plus, X } from "lucide-react";
import { SAMPLE_FAQS } from "@/lib/sample-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible defaultValue="faq-2" className="space-y-4">
      {SAMPLE_FAQS.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={faq.id}
          className="border-b border-border py-4.5 transition-colors data-open:bg-card data-open:rounded-2xl data-open:p-6 sm:data-open:p-7 data-open:border data-open:border-border data-open:shadow-md data-open:animate-fade-in data-open:border-b data-open:py-6"
        >
          <AccordionTrigger className="w-full text-left flex items-start justify-between gap-4 font-display font-bold text-base sm:text-lg text-heading hover:text-primary transition-colors cursor-pointer hover:no-underline py-0 [&>svg:last-child]:hidden group/trigger">
            <span>{faq.question}</span>
            <Plus className="size-5 text-muted-foreground shrink-0 group-data-open/trigger:hidden" />
            <X className="size-5 text-muted-foreground shrink-0 hidden group-data-open/trigger:block mt-0.5 hover:text-heading" />
          </AccordionTrigger>
          <AccordionContent className="pt-3 text-sm sm:text-base text-muted-foreground leading-relaxed pb-0">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

