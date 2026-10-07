"use client";

import { useTranslations } from "next-intl";

/**
 * Header section for Login screen localized with next-intl.
 */
export function LoginHeader() {
  const t = useTranslations("auth");

  return (
    <div className="text-left mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {t("loginTitle")}
      </h1>
      <p className="mt-1.5 text-sm text-slate-600 font-normal">
        {t("loginSubtitle")}
      </p>
    </div>
  );
}
