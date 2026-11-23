import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "./faq-accordion";
import { FaqContactBanner } from "./faq-contact-banner";

export function FaqSection() {
  const t = useTranslations("faq");

  return (
    <section
      id="faq"
      className="min-h-screen flex flex-col justify-center py-16 md:py-24 border-t border-border bg-background overflow-hidden"
    >
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
          <Button asChild variant="primary" size="lg" className="px-8 shadow-sm">
            <Link href="/faq">{t("seeAll")}</Link>
          </Button>
        </div>

        {/* Get in touch soft container preview (from bottom of faqs.png) */}
        <FaqContactBanner />
      </div>
    </section>
  );
}
