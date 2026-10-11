"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, Loader2, Building2 } from "lucide-react";
import {
  submitPartnerApplicationAction,
  type PartnerApplicationActionState,
} from "@/actions/partner-application.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm text-center stack items-center gap-4">
        <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="text-xl font-bold text-heading">{t("successTitle")}</h3>
        <p className="text-sm text-ink-600 max-w-md leading-relaxed">
          {state.message || t("successMessage")}
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-xs"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-xs stack gap-6">
      {state.error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="houseName" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("houseNameLabel")} *
          </Label>
          <Input
            id="houseName"
            name="houseName"
            required
            placeholder={t("houseNamePlaceholder")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactName" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("applicantNameLabel")} *
          </Label>
          <Input
            id="contactName"
            name="contactName"
            required
            placeholder={t("applicantNamePlaceholder")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("phoneLabel")} *
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder={t("phonePlaceholder")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("emailLabel")} *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="neighborhoodId" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("neighborhoodLabel")}
          </Label>
          <select
            id="neighborhoodId"
            name="neighborhoodId"
            disabled={isPending}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{t("selectNeighborhood")}</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="neighborhoodText" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("addressLabel")}
          </Label>
          <Input
            id="neighborhoodText"
            name="neighborhoodText"
            placeholder={t("addressPlaceholder")}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="servicesNote" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("waterSupplyLabel")}
          </Label>
          <Input
            id="servicesNote"
            name="servicesNote"
            placeholder={t("waterSupplyPlaceholder")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hoursNote" className="text-xs font-bold uppercase tracking-wider text-ink-600">
            {t("electricitySupplyLabel")}
          </Label>
          <Input
            id="hoursNote"
            name="hoursNote"
            placeholder={t("electricitySupplyPlaceholder")}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-ink-600">
          {t("notesLabel")}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={3}
          placeholder={t("notesPlaceholder")}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{t("submitting")}</span>
          </>
        ) : (
          <>
            <Building2 className="size-4" />
            <span>{t("submitButton")}</span>
          </>
        )}
      </Button>
    </form>
  );
}
