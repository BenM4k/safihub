"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getDesktopTourSteps, getMobileTourSteps } from "./tour-steps";
import { useTourDriver } from "./use-tour-driver";
import { TourResumeBanner } from "./tour-resume-banner";
import { recordOnboardingReminderAction } from "@/actions/partner-onboarding.actions";
import type { PartnerTourRunnerProps } from "./types";

export function PartnerTourRunner({
  onboarding,
  houseSlug,
  houseName,
  waitingAcceptanceCount,
}: PartnerTourRunnerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isOrderPaused, setIsOrderPaused] = useState(false);
  const [reminderCount, setReminderCount] = useState(onboarding?.reminderCount ?? 0);
  const [dismissedInSession, setDismissedInSession] = useState(false);

  // Responsive device detection
  useEffect(() => {
    function checkDevice() {
      setIsMobile(window.innerWidth < 768);
    }
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const steps = useMemo(() => {
    return isMobile ? getMobileTourSteps() : getDesktopTourSteps(houseName);
  }, [isMobile, houseName]);

  const {
    isActive,
    currentStepIndex,
    startTour,
    stopTour,
    renderStep,
  } = useTourDriver({
    steps,
    houseSlug,
    initialStepId: onboarding?.lastStepId,
    onTourEnd: () => {
      setIsOrderPaused(false);
    },
  });

  const isDashboard = pathname === `/partner/${houseSlug}`;
  const autoStartedRef = useRef(false);

  // Auto-start trigger: only when not_started, on dashboard, and 0 orders waiting
  useEffect(() => {
    if (autoStartedRef.current) return;
    const shouldAutoStart =
      (!onboarding || onboarding.status === "not_started") &&
      isDashboard &&
      waitingAcceptanceCount === 0;

    if (shouldAutoStart) {
      autoStartedRef.current = true;
      const timer = setTimeout(() => {
        startTour(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [onboarding, isDashboard, waitingAcceptanceCount, startTour]);

  // Handle URL query tour=start or custom event safihub:restart-tour
  useEffect(() => {
    const shouldForceStart = searchParams.get("tour") === "start";
    if (shouldForceStart && isDashboard && waitingAcceptanceCount === 0) {
      startTour(0);
    }

    function handleRestartEvent() {
      startTour(0);
    }
    window.addEventListener("safihub:restart-tour", handleRestartEvent);
    return () => window.removeEventListener("safihub:restart-tour", handleRestartEvent);
  }, [searchParams, isDashboard, waitingAcceptanceCount, startTour]);

  // Order arrival guard: pause tour if an order arrives
  useEffect(() => {
    if (isActive && waitingAcceptanceCount > 0) {
      stopTour();
      queueMicrotask(() => {
        setIsOrderPaused(true);
      });
    }
  }, [isActive, waitingAcceptanceCount, stopTour]);

  const handleResume = useCallback(() => {
    setIsOrderPaused(false);
    renderStep(currentStepIndex);
  }, [currentStepIndex, renderStep]);

  const handleDismissReminder = useCallback(async () => {
    setDismissedInSession(true);
    try {
      const res = await recordOnboardingReminderAction();
      if (res.ok) {
        setReminderCount(res.value.reminderCount);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const hasIncompleteTour =
    !isActive &&
    !isOrderPaused &&
    !dismissedInSession &&
    onboarding?.status === "in_progress" &&
    reminderCount < 2;

  return (
    <div className="space-y-3">
      <TourResumeBanner
        isOrderPaused={isOrderPaused}
        hasIncompleteTour={hasIncompleteTour}
        reminderCount={reminderCount}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        onResume={handleResume}
        onDismiss={handleDismissReminder}
      />
    </div>
  );
}
