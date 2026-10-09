"use client";

import { useState, useTransition } from "react";
import { MapPin, Phone, Trash2, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/customer-account.actions";
import { AddAddressDialog } from "./add-address-dialog";
import type { CustomerAddressRecord, NeighborhoodRecord } from "@/dal";

interface AddressesListProps {
  addresses: CustomerAddressRecord[];
  neighborhoods: NeighborhoodRecord[];
  defaultPhone?: string;
}

export function AddressesList({
  addresses,
  neighborhoods,
  defaultPhone = "",
}: AddressesListProps) {
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSetDefault = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await setDefaultAddressAction(id);
      if (!res.success) {
        setError(res.error || t("addressDefaultError"));
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAddressAction(id);
      if (!res.success) {
        setError(res.error || t("addressDeleteError"));
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          {t("addressesTab")}
        </h3>
        <AddAddressDialog
          neighborhoods={neighborhoods}
          defaultPhone={defaultPhone}
        />
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          {t("noAddresses")}
        </p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-xl border transition ${
                addr.isDefault
                  ? "border-primary/40 bg-primary-soft/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {addr.label || addr.neighborhoodName || "Adresse"}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                        {t("defaultBadge")}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="size-3 text-slate-400 shrink-0" />
                    <span>
                      {addr.landmark} ({addr.neighborhoodName})
                    </span>
                  </p>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="size-3 text-slate-400 shrink-0" />
                    <span>{addr.phone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSetDefault(addr.id)}
                      title={t("setDefaultAddress")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(addr.id)}
                    title={t("deleteAddress")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
