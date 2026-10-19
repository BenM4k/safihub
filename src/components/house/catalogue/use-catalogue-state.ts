"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { HouseCatalogueItemRecord } from "@/dal";
import { updateHouseCatalogueBatchAction } from "@/actions/house.actions";
import {
  computeCellDiffs,
  applyPriceToAllFabrics,
  copyPricesFromService,
  bulkAdjustPercentage,
  bulkSetFixedPrice,
  bulkToggleOffered,
} from "./catalogue-helpers";
import type { CatalogueCellEdit, CatalogueArticle } from "./types";

interface UseCatalogueStateParams {
  items: HouseCatalogueItemRecord[];
  houseId: string;
}

export function useCatalogueState({ items, houseId }: UseCatalogueStateParams) {
  const t = useTranslations("house.catalogue");
  const [isPending, startTransition] = useTransition();
  const [edits, setEdits] = useState<Record<string, CatalogueCellEdit>>({});
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute dirty diffs
  const diffs = useMemo(() => computeCellDiffs(items, edits), [items, edits]);

  // Warn before unload when dirty
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (diffs.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [diffs.length]);

  function handleCellChange(key: string, edit: CatalogueCellEdit) {
    setEdits((prev) => ({ ...prev, [key]: edit }));
  }

  function handleToggleArticleSelect(articleId: string) {
    setSelectedArticleIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) next.delete(articleId);
      else next.add(articleId);
      return next;
    });
  }

  function handleApplyPriceToAllFabrics(article: CatalogueArticle) {
    const firstCell = Array.from(article.cellsByFabricId.values())[0];
    if (!firstCell) return;
    const firstKey = `${firstCell.serviceId}_${firstCell.itemId}_${firstCell.fabricId}`;
    const firstEdit = edits[firstKey];
    const sourcePrice = firstEdit !== undefined ? firstEdit.price : firstCell.price;
    const sourceActive = firstEdit !== undefined ? firstEdit.isActive : firstCell.isActive;

    setEdits((prev) =>
      applyPriceToAllFabrics(article, sourcePrice, sourceActive, prev)
    );
  }

  function handleBatchSave(onSuccess?: () => void) {
    if (diffs.length === 0) return;
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    startTransition(async () => {
      const payload = diffs.map((d) => ({
        serviceId: d.serviceId,
        itemId: d.itemId,
        fabricId: d.fabricId,
        price: d.newPrice,
        isActive: d.newActive,
        currency: "CDF" as const,
      }));

      const res = await updateHouseCatalogueBatchAction({
        houseId,
        items: payload,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setEdits({});
        setSelectedArticleIds(new Set());
        setSaveSuccessMsg(t("saveSuccess"));
        setTimeout(() => setSaveSuccessMsg(null), 4000);
        if (onSuccess) onSuccess();
      }
    });
  }

  function handleReset() {
    setEdits({});
    setSelectedArticleIds(new Set());
  }

  return {
    edits,
    diffs,
    selectedArticleIds,
    isPending,
    errorMsg,
    saveSuccessMsg,
    handleCellChange,
    handleToggleArticleSelect,
    handleApplyPriceToAllFabrics,
    handleBatchSave,
    handleReset,
    setEdits,
    setSelectedArticleIds,
    copyServicePrices: (sourceServiceId: string, targetServiceId: string) =>
      setEdits((prev) => copyPricesFromService(sourceServiceId, targetServiceId, items, prev)),
    adjustPercentage: (targetCells: HouseCatalogueItemRecord[], pct: number) =>
      setEdits((prev) => bulkAdjustPercentage(targetCells, pct, prev)),
    setFixedPrice: (targetCells: HouseCatalogueItemRecord[], px: number) =>
      setEdits((prev) => bulkSetFixedPrice(targetCells, px, prev)),
    toggleOffered: (targetCells: HouseCatalogueItemRecord[], offer: boolean) =>
      setEdits((prev) => bulkToggleOffered(targetCells, offer, prev)),
  };
}
