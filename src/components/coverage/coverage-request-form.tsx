"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitCoverageRequestAction, type CoverageActionState } from "@/actions/customer-coverage.actions";
import { Button } from "@/components/ui/button";
import type { NeighborhoodRecord } from "@/dal";

interface CoverageRequestFormProps {
  neighborhoods: NeighborhoodRecord[];
  initialNeighborhoodId?: string;
  defaultPhone?: string;
}

const initialState: CoverageActionState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("coverage");

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={pending}
      className="w-full font-bold gap-2"
    >
      <Send className="size-4" />
      <span>{pending ? t("submitting") : t("submit")}</span>
    </Button>
  );
}

export function CoverageRequestForm({
  neighborhoods,
  initialNeighborhoodId = "",
  defaultPhone = "",
}: CoverageRequestFormProps) {
  const t = useTranslations("coverage");
  const [selectedId, setSelectedId] = useState<string>(initialNeighborhoodId);
  const [isOther, setIsOther] = useState<boolean>(false);

  const [state, formAction] = useActionState(submitCoverageRequestAction, initialState);

  const handleNeighborhoodChange = (value: string) => {
    if (value === "__other__") {
      setIsOther(true);
      setSelectedId("");
    } else {
      setIsOther(false);
      setSelectedId(value);
    }
  };

  if (state.success) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto animate-in zoom-in-95">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {t("successTitle")}
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t("successDesc")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-sm"
        >
          <ArrowLeft className="size-4" />
          <span>{t("backHome")}</span>
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto space-y-5"
    >
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {state.error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Neighborhood Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("selectNeighborhood")}
        </label>
        <select
          value={isOther ? "__other__" : selectedId}
          onChange={(e) => handleNeighborhoodChange(e.target.value)}
          className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        >
          <option value="">-- {t("selectNeighborhood")} --</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.zoneName || "Bukavu"})
            </option>
          ))}
          <option value="__other__">{t("otherNeighborhood")}</option>
        </select>
        <input type="hidden" name="neighborhoodId" value={selectedId} />
      </div>

      {/* Free Text Neighborhood if other */}
      {isOther && (
        <div className="space-y-1.5 animate-in fade-in-50">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("otherNeighborhood")}
          </label>
          <input
            type="text"
            name="neighborhoodText"
            required={isOther}
            placeholder={t("otherPlaceholder")}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
      )}

      {/* Phone Number */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("phoneLabel")}
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={defaultPhone}
          required
          placeholder={t("phonePlaceholder")}
          className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
