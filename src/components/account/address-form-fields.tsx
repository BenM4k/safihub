"use client";

import { useTranslations } from "next-intl";
import type { NeighborhoodRecord } from "@/dal";

interface AddressFormFieldsProps {
  neighborhoods: NeighborhoodRecord[];
  defaultPhone?: string;
}

export function AddressFormFields({
  neighborhoods,
  defaultPhone = "",
}: AddressFormFieldsProps) {
  const t = useTranslations("account");

  return (
    <>
      <div className="space-y-1">
        <label htmlFor="address-label" className="text-xs font-semibold text-slate-600">
          {t("addressLabel")}
        </label>
        <input
          id="address-label"
          type="text"
          name="label"
          placeholder={t("addressLabelPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="address-neighborhood" className="text-xs font-semibold text-slate-600">
          {t("neighborhoodLabel")}
        </label>
        <select
          id="address-neighborhood"
          name="neighborhoodId"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">{t("selectNeighborhood")}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.zoneName || "Bukavu"})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="address-landmark" className="text-xs font-semibold text-slate-600">
          {t("addressLandmarkLabel")}
        </label>
        <input
          id="address-landmark"
          type="text"
          name="landmark"
          required
          placeholder={t("addressLandmarkPlaceholder")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="address-phone" className="text-xs font-semibold text-slate-600">
          {t("addressPhoneLabel")}
        </label>
        <input
          id="address-phone"
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
          id="address-is-default"
          name="isDefault"
          value="true"
          className="rounded border-slate-300 text-primary focus:ring-primary"
        />
        <label htmlFor="address-is-default" className="text-xs text-slate-700 font-medium">
          {t("setDefaultAddress")}
        </label>
      </div>
    </>
  );
}
