"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function RegisterSwitch() {
  const t = useTranslations("auth");

  return (
    <div className="mt-6 text-center text-sm text-slate-600">
      <span>{t("alreadyAccount")} </span>
      <Link
        href="/login"
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        {t("signIn")}
      </Link>
    </div>
  );
}
