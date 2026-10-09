"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openDisputeAction } from "@/actions/customer-order.actions";

interface DisputeFormProps {
  orderId: string;
  orderCode: string;
}

export function DisputeForm({ orderId, orderCode }: DisputeFormProps) {
  const t = useTranslations("disputes");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await openDisputeAction(orderId, formData);
      if (!res.success) {
        setError(res.error || "Impossible d'enregistrer le litige.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 2000);
    } catch {
      setError("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-8 text-center space-y-4 animate-in fade-in">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="text-xl font-black text-emerald-950">Litige enregistré</h3>
        <p className="text-sm text-emerald-800 max-w-md mx-auto">
          {t("disputeOpenedSuccess")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Commande #{orderCode}
        </span>
        <h2 className="text-xl font-black text-slate-900 mt-1">
          {t("title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          {t("reasonLabel")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: "loss", label: t("reasonLoss") },
            { id: "damage", label: t("reasonDamage") },
            { id: "payment", label: t("reasonPayment") },
            { id: "other", label: t("reasonOther") },
          ].map((item, idx) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer has-checked:border-primary has-checked:bg-primary/5 transition"
            >
              <input
                type="radio"
                name="type"
                value={item.id}
                defaultChecked={idx === 0}
                className="size-4 text-primary accent-primary"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
          {t("descriptionLabel")}
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-slate-500 text-xs">
        <Camera className="size-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t("photosNote")}
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full font-black py-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            <span>{t("submitting")}</span>
          </>
        ) : (
          <>
            <AlertTriangle className="size-4 mr-2" />
            <span>{t("submit")}</span>
          </>
        )}
      </Button>
    </form>
  );
}
