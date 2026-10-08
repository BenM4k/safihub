"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NeighborhoodRecord } from "@/dal";

interface SaveSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodRecord[];
  selectedNeighborhoodId?: string;
}

export function SaveSearchDialog({
  isOpen,
  onClose,
  neighborhoods,
  selectedNeighborhoodId,
}: SaveSearchDialogProps) {
  const t = useTranslations("customerHouses");
  const [phone, setPhone] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(selectedNeighborhoodId || (neighborhoods[0]?.id ?? ""));
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="size-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {t("alertSuccess")}
            </h4>
            <p className="text-xs text-slate-500">
              Nous vous notifierons par WhatsApp ou SMS dès qu&apos;un créneau est ouvert.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Bell className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t("alertModalTitle")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("alertModalDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700">
                {t("phoneLabel")}
              </label>
              <input
                type="tel"
                required
                placeholder="+243 999 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {t("neighborhoodLabel")}
              </label>
              <select
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.zoneName || "Bukavu"})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 rounded-xl font-bold text-xs"
              >
                {t("subscribeAlert")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
