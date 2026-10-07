"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LoginSwitch() {
  const t = useTranslations("auth");

  return (
    <div className="mt-8 text-center text-sm text-slate-600">
      <span>{t("noAccount")} </span>
      <Link
        href="/register"
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        {t("createAccount")}
      </Link>
    </div>
  );
}
