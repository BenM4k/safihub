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
  const [isDeviceReady, setIsDeviceReady] = useState(false);
  const [isOrderPaused, setIsOrderPaused] = useState(false);
  const [reminderCount, setReminderCount] = useState(onboarding?.reminderCount ?? 0);
  const [dismissedInSession, setDismissedInSession] = useState(false);

  // Responsive device detection
  useEffect(() => {
    function checkDevice() {
      setIsMobile(window.innerWidth < 768);
      setIsDeviceReady(true);
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
  const forceTourStartedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("tour") !== "start") {
      forceTourStartedRef.current = false;
    }
  }, [searchParams]);

  // Auto-start trigger: only when device is ready, not_started, on dashboard, and 0 orders waiting
  useEffect(() => {
    if (!isDeviceReady || autoStartedRef.current) return;
    const shouldAutoStart =
      (!onboarding || onboarding.status === "not_started") &&
      isDashboard &&
      waitingAcceptanceCount === 0;

    if (shouldAutoStart) {
      const timer = setTimeout(() => {
        autoStartedRef.current = true;
        startTour(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isDeviceReady, onboarding, isDashboard, waitingAcceptanceCount, startTour]);

  // Handle URL query tour=start or custom event safihub:restart-tour
  useEffect(() => {
    const shouldForceStart = searchParams.get("tour") === "start";
    if (
      shouldForceStart &&
      isDeviceReady &&
      !forceTourStartedRef.current &&
      isDashboard &&
      waitingAcceptanceCount === 0
    ) {
      forceTourStartedRef.current = true;
      startTour(0);
    }

    function handleRestartEvent() {
      startTour(0);
    }
    window.addEventListener("safihub:restart-tour", handleRestartEvent);
    return () => window.removeEventListener("safihub:restart-tour", handleRestartEvent);
  }, [searchParams, isDeviceReady, isDashboard, waitingAcceptanceCount, startTour]);

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
    isDashboard &&
    !isActive &&
    !isOrderPaused &&
    !dismissedInSession &&
    onboarding?.status === "in_progress" &&
    reminderCount < 2;

  if (!isOrderPaused && !hasIncompleteTour) {
    return null;
  }

  return (
    <div className="mb-5">
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
