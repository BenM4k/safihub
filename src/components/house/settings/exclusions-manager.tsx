"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { addHouseExclusionAction, deleteHouseExclusionAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import type { HouseExclusionRecord, MasterItemRecord, MasterFabricRecord } from "@/dal";

export function ExclusionsManager({
  exclusions,
  masterItems,
  masterFabrics,
  houseId,
}: {
  exclusions: HouseExclusionRecord[];
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  houseId?: string;
}) {
  const t = useTranslations("house.settings");
  const [isPending, startTransition] = useTransition();

  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedFabricId, setSelectedFabricId] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId && !selectedFabricId) {
      setErrorMsg("Veuillez sélectionner au moins un article ou une matière");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await addHouseExclusionAction({
        itemId: selectedItemId || null,
        fabricId: selectedFabricId || null,
        note: note.trim() || null,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSelectedItemId("");
        setSelectedFabricId("");
        setNote("");
      }
    });
  }

  function handleDelete(exclusionId: string) {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteHouseExclusionAction({ exclusionId, houseId });
      if (!res.ok) {
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">{t("exclusionsTitle")}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t("exclusionsDesc")}</p>
      </div>

      {/* Add Exclusion Form */}
      <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl space-y-3 text-xs border border-slate-200">
        <span className="font-bold text-slate-800 block text-xs">{t("addExclusion")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Article
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            >
              <option value="">Tous les articles</option>
              {masterItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.nameFr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Matière
            </label>
            <select
              value={selectedFabricId}
              onChange={(e) => setSelectedFabricId(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            >
              <option value="">Toutes les matières</option>
              {masterFabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nameFr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              {t("exclusionNote")}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Risque de rétrécissement..."
              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600"
            />
          </div>
        </div>

        {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}

        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs"
        >
          {isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <PlusCircle className="size-3 mr-1" />}
          <span>{t("addExclusion")}</span>
        </Button>
      </form>

      {/* Exclusions List */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {exclusions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {t("noExclusions")}
          </div>
        ) : (
          exclusions.map((ex) => (
            <div key={ex.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">
                    {ex.itemNameFr ?? "Tous articles"} • {ex.fabricNameFr ?? "Toutes matières"}
                  </span>
                  {ex.note && <p className="text-[11px] text-slate-500">{ex.note}</p>}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(ex.id)}
                disabled={isPending}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
