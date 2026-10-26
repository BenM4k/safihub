"use client";

import { useState, useEffect, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateHouseCommandesAction } from "@/actions/house.actions";
import { StickySaveBar } from "@/components/house/catalogue/sticky-save-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { PauseDialog } from "./pause-dialog";
import { AvailabilitySection } from "./commandes/availability-section";
import { CapacitySection } from "./commandes/capacity-section";
import { MinimumOrderSection } from "./commandes/minimum-order-section";
import { AdvancedProposalsSection } from "./commandes/advanced-proposals-section";
import type { HouseRecord } from "@/dal";

interface CommandesTabProps {
  house: HouseRecord;
  todayOrdersCount: number;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function CommandesTab({
  house,
  todayOrdersCount,
  onDirtyChange,
}: CommandesTabProps) {
  const [isPending, startTransition] = useTransition();

  // Baseline
  const initialIsPaused = house.isPaused;
  const initialPausedUntil = house.pausedUntil
    ? new Date(house.pausedUntil).toISOString()
    : null;
  const initialCapacity = house.dailyCapacity;
  const initialMinAmount = house.minimumOrderAmount;

  // Form State
  const [isPaused, setIsPaused] = useState<boolean>(initialIsPaused);
  const [pausedUntil, setPausedUntil] = useState<string | null>(initialPausedUntil);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState<boolean>(false);

  const [hasCapacityLimit, setHasCapacityLimit] = useState<boolean>(initialCapacity !== null);
  const [dailyCapacity, setDailyCapacity] = useState<number | null>(initialCapacity);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState<number>(initialMinAmount);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dirty count
  const effectiveCapacity = hasCapacityLimit ? dailyCapacity : null;
  const isDirty =
    isPaused !== initialIsPaused ||
    pausedUntil !== initialPausedUntil ||
    effectiveCapacity !== initialCapacity ||
    minimumOrderAmount !== initialMinAmount;

  const dirtyCount = isDirty ? 1 : 0;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleTogglePause() {
    if (isPaused) {
      setIsPaused(false);
      setPausedUntil(null);
      setPauseReason(null);
    } else {
      setIsPauseDialogOpen(true);
    }
  }

  function handlePauseConfirm(data: { reason: string; pausedUntil: string | null }) {
    setIsPaused(true);
    setPausedUntil(data.pausedUntil);
    setPauseReason(data.reason);
    setIsPauseDialogOpen(false);
  }

  function handleReset() {
    setIsPaused(initialIsPaused);
    setPausedUntil(initialPausedUntil);
    setPauseReason(null);
    setHasCapacityLimit(initialCapacity !== null);
    setDailyCapacity(initialCapacity);
    setMinimumOrderAmount(initialMinAmount);
    setErrorMsg(null);
  }

  function handleSave() {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await updateHouseCommandesAction({
        houseId: house.id,
        isPaused,
        pausedUntil,
        pauseReason,
        dailyCapacity: hasCapacityLimit ? dailyCapacity : null,
        minimumOrderAmount,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Paramètres des commandes enregistrés avec succès.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}
      {successMsg && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* 1. Pause Switch Box */}
      <AvailabilitySection
        isPaused={isPaused}
        pausedUntil={pausedUntil}
        pauseReason={pauseReason}
        onTogglePause={handleTogglePause}
      />
      <Separator />

      {/* 2. Daily Capacity */}
      <CapacitySection
        hasCapacityLimit={hasCapacityLimit}
        dailyCapacity={dailyCapacity}
        todayOrdersCount={todayOrdersCount}
        onToggleLimit={(checked) => {
          setHasCapacityLimit(checked);
          if (checked && !dailyCapacity) setDailyCapacity(25);
        }}
        onChangeCapacity={setDailyCapacity}
      />
      <Separator />

      {/* 3. Minimum Order Amount */}
      <MinimumOrderSection
        minimumOrderAmount={minimumOrderAmount}
        onChangeAmount={setMinimumOrderAmount}
      />
      <Separator />

      {/* 4. Proposed Platform Fields */}
      <AdvancedProposalsSection />

      {/* Sticky Save Bar */}
      <StickySaveBar
        dirtyCount={dirtyCount}
        isSaving={isPending}
        onCancel={handleReset}
        onSave={handleSave}
      />

      {/* Pause Confirmation Dialog */}
      <PauseDialog
        isOpen={isPauseDialogOpen}
        onClose={() => setIsPauseDialogOpen(false)}
        onConfirm={handlePauseConfirm}
      />
    </div>
  );
}
