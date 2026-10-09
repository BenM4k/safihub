import { getTranslations } from "next-intl/server";
import { AlertCircle, EyeOff, Sparkles } from "lucide-react";

export async function ConsentCaptureRules() {
  const t = await getTranslations("consentPage");

  return (
    <section className="scroll-mt-28 space-y-6">
      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
        {t("rulesTitle")}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
        {t("rulesSubtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <Sparkles className="size-4" />
            <span>{t("authorizedTitle")}</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>{t("authorized1")}</li>
            <li>{t("authorized2")}</li>
            <li>{t("authorized3")}</li>
            <li>{t("authorized4")}</li>
          </ul>
        </div>

        <div className="rounded-xl border border-red-200/60 bg-red-50/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
            <EyeOff className="size-4" />
            <span>{t("prohibitedTitle")}</span>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2 list-disc list-inside">
            <li>{t("prohibited1")}</li>
            <li>{t("prohibited2")}</li>
            <li>{t("prohibited3")}</li>
            <li>{t("prohibited4")}</li>
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>{t("thresholdNoticeStrong")} </strong>
          {t("thresholdNoticeText")}
        </div>
      </div>
    </section>
  );
}
