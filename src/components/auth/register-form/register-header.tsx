"use client";

import { useTranslations } from "next-intl";

/**
 * Header section for Register / Sign-up screen matching reference sign-up.png.
 */
export function RegisterHeader() {
  const t = useTranslations("auth");

  return (
    <div className="text-left mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {t("registerTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-600 font-normal">
        {t("registerSubtitle")}
      </p>

      {/* 5-step indicator dots from reference */}
      <div
        className="flex items-center gap-2 mt-4 mb-2"
        role="progressbar"
        aria-label={t("registerProgress")}
        aria-valuenow={1}
        aria-valuemin={1}
        aria-valuemax={5}
      >
        <span className="size-2 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-slate-200" />
        <span className="size-1.5 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
