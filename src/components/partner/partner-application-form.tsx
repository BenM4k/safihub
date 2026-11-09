"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2, Send, ShieldCheck, Sparkles } from "lucide-react";
import {
  submitPartnerApplicationAction,
  type PartnerApplicationActionState,
} from "@/actions/partner-application.actions";
import { Button } from "@/components/ui/button";
import { PartnerApplicationFields } from "./partner-application-fields";

interface PartnerApplicationFormProps {
  neighborhoods: { id: string; name: string }[];
}

const initialState: PartnerApplicationActionState = {
  success: false,
};

export function PartnerApplicationForm({ neighborhoods }: PartnerApplicationFormProps) {
  const t = useTranslations("partnerApply");
  const [state, formAction, isPending] = useActionState(
    submitPartnerApplicationAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-8 sm:p-10 shadow-xs text-center flex flex-col items-center gap-4">
        <div className="size-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="size-9" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-heading">{t("successTitle")}</h3>
        <p className="text-sm sm:text-base text-ink-600 dark:text-muted-foreground max-w-md leading-relaxed">
          {state.message || t("successMessage")}
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-xs"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-white dark:bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs flex flex-col gap-7"
    >
      {/* Form Card Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-heading">
              Dossier d&apos;Adhésion Pressing
            </h2>
            <p className="text-xs text-muted-foreground">
              Formulaire officiel pour blanchisseries et pressings certifiés
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-muted-foreground">
          Bukavu, RDC
        </span>
      </div>

      {state.error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Structured Sections */}
      <PartnerApplicationFields
        neighborhoods={neighborhoods}
        disabled={isPending}
        t={t}
      />

      {/* Form Action & Trust Footnote */}
      <div className="pt-2 flex flex-col gap-3.5 border-t border-border/70">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full min-h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-base transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("submitting")}</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>{t("submitButton")}</span>
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Dossier confidentiel • Examen sous 24-48h à Bukavu • Sans engagement</span>
        </p>
      </div>
    </form>
  );
}
