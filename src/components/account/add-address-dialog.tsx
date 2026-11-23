"use client";

import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { createAddressAction } from "@/actions/customer-account.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="font-bold gap-1.5"
        >
          <Plus className="size-4" />
          <span>{t("addAddress")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <MapPin className="size-5 text-primary" />
          <DialogTitle className="text-slate-900 font-bold text-lg">
            {t("addAddress")}
          </DialogTitle>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AddressFormFields
            neighborhoods={neighborhoods}
            defaultPhone={defaultPhone}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                {t("cancel")}
              </Button>
            </DialogClose>
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
      </DialogContent>
    </Dialog>
  );
}
