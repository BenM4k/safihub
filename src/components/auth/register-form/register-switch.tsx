"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function RegisterSwitch() {
  const t = useTranslations("auth");

  return (
    <div className="mt-6 text-center text-sm text-slate-600 space-y-3">
      <div>
        <span>{t("alreadyAccount")} </span>
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {t("signIn")}
        </Link>
      </div>
      <div className="pt-3 border-t border-slate-100 text-xs">
        <Link
          href="/partners/apply"
          className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1 font-medium"
        >
          {t("becomePartner")} →
        </Link>
      </div>
    </div>
  );
}
