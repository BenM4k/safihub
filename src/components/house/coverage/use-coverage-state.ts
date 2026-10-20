"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateNeighborhoodCoverageBatchAction } from "@/actions/house.actions";
import type { HouseCoverageWithLimitsItem } from "@/dal";
import type { CoverageDiff, TriState } from "./types";

interface UseCoverageStateProps {
  items: HouseCoverageWithLimitsItem[];
  houseId?: string;
}

export function useCoverageState({ items, houseId }: UseCoverageStateProps) {
  const t = useTranslations("house.coverage");
  const [isPending, startTransition] = useTransition();

  const [initialMap, setInitialMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const it of items) {
      map[it.neighborhoodId] = it.isCovered;
    }
    return map;
  });

  const [coveredMap, setCoveredMap] = useState<Record<string, boolean>>(initialMap);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Dialog states
  const [impactTarget, setImpactTarget] = useState<{
    neighborhoodId: string;
    neighborhoodName: string;
    activeOrdersCount: number;
  } | null>(null);

  const [showZeroModal, setShowZeroModal] = useState(false);

  // Items lookup
  const itemsById = useMemo(() => {
    const map = new Map<string, HouseCoverageWithLimitsItem>();
    for (const it of items) {
      map.set(it.neighborhoodId, it);
    }
    return map;
  }, [items]);

  // Compute diffs
  const diffs = useMemo<CoverageDiff[]>(() => {
    const changes: CoverageDiff[] = [];
    for (const it of items) {
      const prev = Boolean(initialMap[it.neighborhoodId]);
      const current = Boolean(coveredMap[it.neighborhoodId]);
      if (prev !== current) {
        changes.push({
          neighborhoodId: it.neighborhoodId,
          neighborhoodName: it.neighborhoodName,
          previousValue: prev,
          nextValue: current,
        });
      }
    }
    return changes;
  }, [items, initialMap, coveredMap]);

  const dirtyIds = useMemo(() => new Set(diffs.map((d) => d.neighborhoodId)), [diffs]);

  // Total counts
  const totalCoveredCount = useMemo(() => {
    return Object.values(coveredMap).filter(Boolean).length;
  }, [coveredMap]);

  // Unsaved changes warning on browser refresh / navigation
  useEffect(() => {
    if (diffs.length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [diffs.length]);

  function handleToggle(neighborhoodId: string) {
    const item = itemsById.get(neighborhoodId);
    if (!item) return;

    const currentVal = Boolean(coveredMap[neighborhoodId]);
    const nextVal = !currentVal;

    // Disallow enabling if beyond distance limit
    if (nextVal && !item.isAllowedByDistance) {
      setErrorMsg(t("distanceLimitExceeded"));
      return;
    }

    // Safeguard: deselecting with active orders in progress
    if (!nextVal && (item.activeOrdersCount ?? 0) > 0) {
      setImpactTarget({
        neighborhoodId,
        neighborhoodName: item.neighborhoodName,
        activeOrdersCount: item.activeOrdersCount ?? 0,
      });
      return;
    }

    setErrorMsg(null);
    setSaveSuccessMsg(null);
    setCoveredMap((prev) => ({ ...prev, [neighborhoodId]: nextVal }));
  }

  function confirmImpactDeselect() {
    if (!impactTarget) return;
    const { neighborhoodId } = impactTarget;
    setImpactTarget(null);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
    setCoveredMap((prev) => ({ ...prev, [neighborhoodId]: false }));
  }

  function cancelImpactDeselect() {
    setImpactTarget(null);
  }

  function handleGroupToggle(groupItems: HouseCoverageWithLimitsItem[]) {
    const eligible = groupItems.filter((i) => i.isAllowedByDistance);
    if (eligible.length === 0) return;

    const allSelected = eligible.every((i) => Boolean(coveredMap[i.neighborhoodId]));
    const nextVal = !allSelected;

    setErrorMsg(null);
    setSaveSuccessMsg(null);

    // Safeguard when deselecting: check if any item has active orders
    if (!nextVal) {
      const itemsWithOrders = eligible.filter((i) => (i.activeOrdersCount ?? 0) > 0);
      if (itemsWithOrders.length > 0) {
        // Trigger impact dialog on the first impacted item, while deselecting those without active orders
        const firstImpacted = itemsWithOrders[0];
        setCoveredMap((prev) => {
          const updated = { ...prev };
          for (const item of eligible) {
            if ((item.activeOrdersCount ?? 0) === 0) {
              updated[item.neighborhoodId] = false;
            }
          }
          return updated;
        });

        setImpactTarget({
          neighborhoodId: firstImpacted.neighborhoodId,
          neighborhoodName: firstImpacted.neighborhoodName,
          activeOrdersCount: firstImpacted.activeOrdersCount ?? 0,
        });
        return;
      }
    }

    setCoveredMap((prev) => {
      const updated = { ...prev };
      for (const item of eligible) {
        updated[item.neighborhoodId] = nextVal;
      }
      return updated;
    });
  }

  function getGroupTriState(groupItems: HouseCoverageWithLimitsItem[]): TriState {
    const eligible = groupItems.filter((i) => i.isAllowedByDistance);
    if (eligible.length === 0) return "none";

    const selectedCount = eligible.filter((i) => Boolean(coveredMap[i.neighborhoodId])).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === eligible.length) return "all";
    return "some";
  }

  function handleReset() {
    setCoveredMap(initialMap);
    setErrorMsg(null);
    setSaveSuccessMsg(null);
  }

  function triggerSave(forceZero = false) {
    if (diffs.length === 0) return;

    if (totalCoveredCount === 0 && !forceZero) {
      setShowZeroModal(true);
      return;
    }

    setErrorMsg(null);
    setSaveSuccessMsg(null);

    startTransition(async () => {
      const payload = diffs.map((d) => ({
        neighborhoodId: d.neighborhoodId,
        isActive: d.nextValue,
      }));

      const res = await updateNeighborhoodCoverageBatchAction({
        items: payload,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }

      // Update initial map
      setInitialMap((prev) => {
        const next = { ...prev };
        for (const item of payload) {
          next[item.neighborhoodId] = item.isActive;
        }
        return next;
      });

      setSaveSuccessMsg(t("saveSuccess"));
      setShowZeroModal(false);

      setTimeout(() => {
        setSaveSuccessMsg(null);
      }, 5000);
    });
  }

  return {
    coveredMap,
    diffs,
    dirtyIds,
    dirtyCount: diffs.length,
    totalCoveredCount,
    isSaving: isPending,
    errorMsg,
    saveSuccessMsg,
    impactTarget,
    showZeroModal,
    setShowZeroModal,
    handleToggle,
    confirmImpactDeselect,
    cancelImpactDeselect,
    handleGroupToggle,
    getGroupTriState,
    handleReset,
    triggerSave,
    setErrorMsg,
  };
}
