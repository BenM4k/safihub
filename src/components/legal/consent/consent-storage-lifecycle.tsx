import { getTranslations } from "next-intl/server";
import { Cloud, Clock, RefreshCw } from "lucide-react";

export async function ConsentStorageLifecycle() {
  const t = await getTranslations("consentPage");

  return (
    <section className="scroll-mt-28 space-y-6">
      <h2 className="font-display text-lg sm:text-xl font-bold text-heading">
        {t("lifecycleTitle")}
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {t("lifecycleSubtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <RefreshCw className="size-4" />
          </div>
          <h3 className="font-semibold text-heading text-sm">{t("cardCompressionTitle")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("cardCompressionDesc")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Cloud className="size-4" />
          </div>
          <h3 className="font-semibold text-heading text-sm">{t("cardSignedUrlsTitle")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("cardSignedUrlsDesc")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="size-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
          <h3 className="font-semibold text-heading text-sm">{t("cardPurgeTitle")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("cardPurgeDesc")}
          </p>
        </div>
      </div>
    </section>
  );
}
