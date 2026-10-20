"use client";

import { useTranslations } from "next-intl";

export function ResetPasswordHeader() {
  const t = useTranslations("auth");

  return (
    <div className="text-left mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
        {t("resetPasswordTitle")}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground font-normal">
        {t("resetPasswordSubtitle")}
      </p>
    </div>
  );
}
