"use client";

import { useTranslations } from "next-intl";

export function ForgotPasswordHeader() {
  const t = useTranslations("auth");

  return (
    <div className="text-left mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {t("forgotPasswordTitle")}
      </h1>
      <p className="mt-1.5 text-sm text-slate-600 font-normal">
        {t("forgotPasswordSubtitle")}
      </p>
    </div>
  );
}
