"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateHouseCatalogueItemAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { HouseCatalogueItemRecord } from "@/dal";

export function CatalogueTable({
  items,
  houseId,
}: {
  items: HouseCatalogueItemRecord[];
  houseId?: string;
}) {
  const t = useTranslations("house.catalogue");
  const [isPending, startTransition] = useTransition();
  const [selectedService, setSelectedService] = useState<string>("all");
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [activeStatuses, setActiveStatuses] = useState<Record<string, boolean>>({});
  const [savedRowKey, setSavedRowKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract unique services
  const services = Array.from(
    new Map(items.map((i) => [i.serviceId, { id: i.serviceId, name: i.serviceNameFr }])).values()
  );

  const filteredItems = items.filter(
    (i) => selectedService === "all" || i.serviceId === selectedService
  );

  function getRowKey(it: HouseCatalogueItemRecord) {
    return `${it.serviceId}_${it.itemId}_${it.fabricId}`;
  }

  function handleSave(it: HouseCatalogueItemRecord) {
    const key = getRowKey(it);
    const newPrice = editingPrices[key] !== undefined ? editingPrices[key] : it.price;
    const newActive = activeStatuses[key] !== undefined ? activeStatuses[key] : it.isActive;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateHouseCatalogueItemAction({
        serviceId: it.serviceId,
        itemId: it.itemId,
        fabricId: it.fabricId,
        price: newPrice,
        isActive: newActive,
        currency: it.currency,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSavedRowKey(key);
        setTimeout(() => setSavedRowKey(null), 2000);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Service filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setSelectedService("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedService === "all"
              ? "bg-violet-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Tous les services ({items.length})
        </button>
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedService(s.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedService === s.id
                ? "bg-violet-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Pricing Invariant Banner */}
      <div className="p-3.5 bg-violet-50/70 border border-violet-200 rounded-xl flex items-start gap-2.5 text-xs text-violet-900">
        <AlertCircle className="size-4 shrink-0 text-violet-600 mt-0.5" />
        <div>
          <strong className="font-bold">Règle de gel des prix :</strong>{" "}
          {t("priceNotice")}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">{t("serviceCol")}</th>
                <th className="py-3 px-4">{t("itemCol")}</th>
                <th className="py-3 px-4">{t("fabricCol")}</th>
                <th className="py-3 px-4">{t("priceCol")}</th>
                <th className="py-3 px-4 text-center">{t("activeCol")}</th>
                <th className="py-3 px-4 text-right">{t("actionCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((it) => {
                const key = getRowKey(it);
                const currentPrice =
                  editingPrices[key] !== undefined ? editingPrices[key] : it.price;
                const currentActive =
                  activeStatuses[key] !== undefined ? activeStatuses[key] : it.isActive;
                const isSaved = savedRowKey === key;

                return (
                  <tr key={key} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {it.serviceNameFr}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {it.itemNameFr}
                      {it.itemCategory && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {it.itemCategory}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {it.fabricNameFr}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={currentPrice}
                          onChange={(e) =>
                            setEditingPrices((prev) => ({
                              ...prev,
                              [key]: Math.max(0, parseInt(e.target.value) || 0),
                            }))
                          }
                          className="w-24 h-8 px-2 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
                        />
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {it.currency}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveStatuses((prev) => ({
                            ...prev,
                            [key]: !currentActive,
                          }))
                        }
                        className={`size-6 rounded-md inline-flex items-center justify-center transition ${
                          currentActive
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <Check className="size-3.5" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleSave(it)}
                        disabled={isPending}
                        className={`text-xs font-semibold h-8 ${
                          isSaved
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isSaved ? (
                          <>
                            <Check className="size-3 mr-1" /> Enregistré
                          </>
                        ) : (
                          t("savePrice")
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
