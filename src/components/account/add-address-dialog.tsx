"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { createAddressAction } from "@/actions/customer-account.actions";
import { Button } from "@/components/ui/button";
import type { NeighborhoodRecord } from "@/dal";
import { AddressFormFields } from "./address-form-fields";

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

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
      return;
    }

    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const res = await createAddressAction({ success: false }, formData);

    setIsPending(false);
    if (!res.success) {
      setError(res.error || t("addressSaveError"));
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div>
      <Button
        ref={triggerRef}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-address-title"
          ref={dialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50 outline-hidden"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("cancel")}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-lg">
              <MapPin className="size-5 text-primary" />
              <h4 id="add-address-title">{t("addAddress")}</h4>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AddressFormFields
                neighborhoods={neighborhoods}
                defaultPhone={defaultPhone}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  {t("cancel")}
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
