import { getTranslations } from "next-intl/server";
import { UserCheck, MessageSquare } from "lucide-react";

export async function ConsentCustomerRights() {
  const t = await getTranslations("consentPage");

  return (
    <section className="scroll-mt-28 space-y-6">
      <h2 className="font-display text-lg sm:text-xl font-bold text-heading">
        {t("rightsTitle")}
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {t("rightsSubtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-heading font-semibold text-sm">
            <UserCheck className="size-4 text-sky-600 dark:text-sky-400" />
            <span>{t("cardAccountTitle")}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("cardAccountDesc")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-heading font-semibold text-sm">
            <MessageSquare className="size-4 text-sky-600 dark:text-sky-400" />
            <span>{t("cardSupportTitle")}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("cardSupportDesc")}{" "}
            <a
              href="mailto:privacy@safihub.cd"
              className="font-medium text-sky-600 dark:text-sky-400 hover:underline"
            >
              privacy@safihub.cd
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
