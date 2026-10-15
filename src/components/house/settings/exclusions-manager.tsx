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
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-5">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-bold text-heading">{t("exclusionsTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t("exclusionsDesc")}</p>
      </div>

      {/* Add Exclusion Form */}
      <form onSubmit={handleAdd} className="bg-surface p-4 rounded-xl space-y-3 text-xs border border-border">
        <span className="font-bold text-heading block text-xs">{t("addExclusion")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              Article
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              Matière
            </label>
            <select
              value={selectedFabricId}
              onChange={(e) => setSelectedFabricId(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <label className="text-[11px] font-semibold text-foreground block mb-1">
              {t("exclusionNote")}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Risque de rétrécissement..."
              className="w-full h-8 px-2 rounded-lg border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {errorMsg && <p className="text-xs text-destructive font-semibold">{errorMsg}</p>}

        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs"
        >
          {isPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <PlusCircle className="size-3 mr-1" />}
          <span>{t("addExclusion")}</span>
        </Button>
      </form>

      {/* Exclusions List */}
      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {exclusions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {t("noExclusions")}
          </div>
        ) : (
          exclusions.map((ex) => (
            <div key={ex.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-surface">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-warning shrink-0" />
                <div>
                  <span className="font-bold text-heading">
                    {ex.itemNameFr ?? "Tous articles"} • {ex.fabricNameFr ?? "Toutes matières"}
                  </span>
                  {ex.note && <p className="text-[11px] text-muted-foreground">{ex.note}</p>}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(ex.id)}
                disabled={isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive-soft h-7 px-2"
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
