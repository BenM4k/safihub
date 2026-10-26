"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";

export function RegisterSwitch() {
  const t = useTranslations("auth");

  return (
    <div className="mt-6 text-center text-sm text-muted-foreground flex flex-col gap-3">
      <div>
        <span>{t("alreadyAccount")} </span>
        <Link
          href="/login"
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {t("signIn")}
        </Link>
      </div>
      <Separator />
      <div className="text-xs">
        <Link
          href="/partners/apply"
          className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 font-medium"
        >
          {t("becomePartner")} →
        </Link>
      </div>
    </div>
  );
}
