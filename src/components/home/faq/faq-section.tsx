import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "./faq-accordion";

export function FaqSection() {
  const t = useTranslations("faq");

  return (
    <section id="faq" className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-background overflow-hidden">
      <div className="container-page flex flex-col items-center">
        {/* Title matching reference faqs.png */}
        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-heading text-center mb-12 tracking-tight">
          {t("title")}
        </h2>

        {/* Clean Accordion List matching reference */}
        <div className="w-full max-w-4xl lg:max-w-5xl mb-10">
          <FaqAccordion />
        </div>

        {/* Centered Blue Button (from faqs.png) */}
        <div className="mb-14">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="px-8 shadow-sm"
          >
            {t("seeAll")}
          </Button>
        </div>

        {/* Get in touch soft container preview (from bottom of faqs.png) */}
        <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl bg-primary-soft/50 dark:bg-card border border-primary/20 dark:border-border p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-heading">
              {t("contactTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("contactSubtitle")}
            </p>
          </div>

          <Button asChild variant="contrast" size="default" className="shrink-0 dark:bg-primary dark:text-white dark:hover:bg-primary-hover">
            <a
              href="https://wa.me/243999000123"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("contactCta")}</span>
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
