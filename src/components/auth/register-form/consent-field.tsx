"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ConsentFieldProps {
  error?: string;
  registration: UseFormRegisterReturn;
  photoRegistration?: UseFormRegisterReturn;
}

export function ConsentField({
  error,
  registration,
  photoRegistration,
}: ConsentFieldProps) {
  const t = useTranslations("auth");

  return (
    <div className="space-y-3 pt-1">
      {/* Mandatory Terms & Privacy Consent */}
      <div className="space-y-1">
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

      {/* Recommended Photo Consent (CLOTHES ONLY) */}
      {photoRegistration && (
        <div className="flex items-start gap-2.5 pt-0.5">
          <input
            id="register-photo-consent"
            type="checkbox"
            defaultChecked
            className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-sky-600"
            {...photoRegistration}
          />
          <label
            htmlFor="register-photo-consent"
            className="text-xs sm:text-sm text-slate-600 leading-normal cursor-pointer select-none"
          >
            {t("photoConsentLabel")}{" "}
            <Link
              href="/consent"
              target="_blank"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              {t("photoConsentLink")}
            </Link>
            .
          </label>
        </div>
      )}
    </div>
  );
}
