"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { ConsentDocumentType } from "@/dal";

interface ConsentsHistoryProps {
  consents: Array<{
    id: string;
    document: ConsentDocumentType;
    version: string;
    acceptedAt: Date;
  }>;
}

export function ConsentsHistory({ consents }: ConsentsHistoryProps) {
  const t = useTranslations("account");
  const locale = useLocale();

  const getDocName = (doc: ConsentDocumentType) => {
    switch (doc) {
      case "terms":
        return t("consentTerms");
      case "privacy":
        return t("consentPrivacy");
      case "photos":
        return t("consentPhotos");
      default:
        return doc;
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          <span>{t("consentsTitle")}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("consentsDesc")}
        </p>
      </div>

      <div className="space-y-3">
        {consents.map((c) => (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {getDocName(c.document)}
                </p>
                <p className="text-xs text-slate-500">
                  {t("consentVersion", { version: c.version })}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-medium text-slate-500 self-start sm:self-auto">
              {t("consentAcceptedAt", {
                date: new Date(c.acceptedAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
