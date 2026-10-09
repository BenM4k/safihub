"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerAddressRecord, NeighborhoodRecord } from "@/dal";

interface AddressPickerProps {
  savedAddresses: CustomerAddressRecord[];
  neighborhoods: NeighborhoodRecord[];
  selectedAddressId: string | null;
  onSelectSavedAddress: (addr: CustomerAddressRecord) => void;
  neighborhoodId: string;
  onChangeNeighborhood: (id: string) => void;
  landmark: string;
  onChangeLandmark: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  customerName?: string;
  onChangeCustomerName?: (val: string) => void;
  isGuest?: boolean;
}

export function AddressPicker({
  savedAddresses,
  neighborhoods,
  selectedAddressId,
  onSelectSavedAddress,
  neighborhoodId,
  onChangeNeighborhood,
  landmark,
  onChangeLandmark,
  phone,
  onChangePhone,
  customerName,
  onChangeCustomerName,
  isGuest = false,
}: AddressPickerProps) {
  const t = useTranslations("checkout");

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
        <MapPin className="size-4 text-primary" />
        <span>{t("stepAddress")}</span>
      </div>

      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("savedAddresses")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectSavedAddress(addr)}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    isSelected
                      ? "border-primary bg-primary-soft/30 text-primary font-bold shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <p className="font-bold text-slate-900">
                    {addr.label || addr.neighborhoodName}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {addr.landmark} ({addr.neighborhoodName})
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Phone className="size-3 text-slate-400" />
                    <span>{addr.phone}</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-1">
        {isGuest && onChangeCustomerName && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              {t("customerName")}
            </label>
            <input
              type="text"
              required
              value={customerName || ""}
              onChange={(e) => onChangeCustomerName(e.target.value)}
              placeholder="Ex. Jean-Luc Birindwa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            {t("neighborhood")}
          </label>
          <select
            value={neighborhoodId}
            onChange={(e) => onChangeNeighborhood(e.target.value)}
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
            {t("landmark")}
          </label>
          <input
            type="text"
            required
            value={landmark}
            onChange={(e) => onChangeLandmark(e.target.value)}
            placeholder="Ex. Avenue Patrice Lumumba n° 23, en face de l'hôtel"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600">
            {t("contactPhone")}
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="0991234567"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
