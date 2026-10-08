"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Bell } from "lucide-react";
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
  const [neighborhoodId, setNeighborhoodId] = useState(
    selectedNeighborhoodId || (neighborhoods[0]?.id ?? "")
  );
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    // Submission is disabled until persistent subscription server action is implemented
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-search-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in outline-hidden"
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="size-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Bell className="size-5" />
            </div>
            <div>
              <h3 id="save-search-title" className="text-base font-bold text-slate-900">
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
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs opacity-60 cursor-not-allowed"
            >
              {t("subscribeAlert")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
