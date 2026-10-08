"use client";

import { useState } from "react";
import { Plus, X, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { createAddressAction } from "@/actions/customer-account.actions";
import { Button } from "@/components/ui/button";
import type { NeighborhoodRecord } from "@/dal";

interface AddAddressDialogProps {
  neighborhoods: NeighborhoodRecord[];
  defaultPhone?: string;
}

export function AddAddressDialog({
  neighborhoods,
  defaultPhone = "",
}: AddAddressDialogProps) {
  const t = useTranslations("account");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const res = await createAddressAction({ success: false }, formData);

    setIsPending(false);
    if (!res.success) {
      setError(res.error || "Erreur lors de l'enregistrement de l'adresse.");
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-bold gap-1.5"
      >
        <Plus className="size-4" />
        <span>{t("addAddress")}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg">
              <MapPin className="size-5 text-primary" />
              <h4>{t("addAddress")}</h4>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  {t("addressLabel")}
                </label>
                <input
                  type="text"
                  name="label"
                  placeholder={t("addressLabelPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Quartier
                </label>
                <select
                  name="neighborhoodId"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Sélectionnez un quartier</option>
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.zoneName || "Bukavu"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  {t("addressLandmarkLabel")}
                </label>
                <input
                  type="text"
                  name="landmark"
                  required
                  placeholder={t("addressLandmarkPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  {t("addressPhoneLabel")}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  defaultValue={defaultPhone}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  value="true"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="text-xs text-slate-700 font-medium">
                  {t("setDefaultAddress")}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="font-bold"
                >
                  {isPending ? "..." : t("saveAddress")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
