import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function FaqContactBanner() {
  const t = useTranslations("faq");

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl rounded-3xl bg-primary-soft/50 dark:bg-card border border-primary/20 dark:border-border p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-xl font-bold text-heading">
          {t("contactTitle")}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("contactSubtitle")}
        </p>
      </div>

      <Button
        asChild
        variant="contrast"
        size="default"
        className="shrink-0 dark:bg-primary dark:text-white dark:hover:bg-primary-hover"
      >
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
  );
}
