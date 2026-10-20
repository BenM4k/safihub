import { getTranslations } from "next-intl/server";
import { Camera, ShieldCheck, CheckCircle2 } from "lucide-react";

export async function ConsentPolicyHero() {
  const t = await getTranslations("consentPage");
  return (
    <section className="scroll-mt-28">
      <div className="rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-sky-600/10 dark:bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400">
            <Camera className="size-6" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-heading">
              {t("heroTitle")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("heroDescription")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-card/80 p-2.5 rounded-lg border border-sky-200/50 dark:border-sky-800/40">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t("pillTextiles")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-card/80 p-2.5 rounded-lg border border-sky-200/50 dark:border-sky-800/40">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t("pillExif")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-card/80 p-2.5 rounded-lg border border-sky-200/50 dark:border-sky-800/40">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t("pillPurge")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
