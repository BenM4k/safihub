"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ConsentFieldProps {
  error?: string;
  registration: UseFormRegisterReturn;
}

export function ConsentField({ error, registration }: ConsentFieldProps) {
  const t = useTranslations("auth");

  return (
    <div className="space-y-1 pt-1">
      <div className="flex items-start gap-2.5">
        <input
          id="register-consent"
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-sky-600"
          aria-describedby={error ? "consent-error" : undefined}
          {...registration}
        />
        <label
          htmlFor="register-consent"
          className="text-xs sm:text-sm text-slate-600 leading-normal cursor-pointer select-none"
        >
          {t("consentLabel")}{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t("termsLink")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t("privacyLink")}
          </Link>
          . <span className="text-red-500">*</span>
        </label>
      </div>

      {error && (
        <p
          id="consent-error"
          className="text-xs font-medium text-red-500 pl-6.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}
