"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  updateOnboardingStepAction,
  skipOnboardingTourAction,
} from "@/actions/partner-onboarding.actions";
import { waitForTourElement } from "./dom-waiter";
import { configureTourPopover, resolveInitialStepIndex } from "./popover-helpers";
import type { TourStepConfig } from "./types";
import type { Driver } from "driver.js";

interface UseTourDriverOptions {
  steps: TourStepConfig[];
  houseSlug: string;
  initialStepId?: string | null;
  onTourEnd?: () => void;
}

export function useTourDriver({
  steps,
  houseSlug,
  initialStepId,
  onTourEnd,
}: UseTourDriverOptions) {
  const t = useTranslations("house.tour");
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const currentStepIndex =
    activeStepIndex !== null && activeStepIndex < steps.length
      ? activeStepIndex
      : resolveInitialStepIndex(steps, initialStepId);

  const driverRef = useRef<Driver | null>(null);
  const currentStepIndexRef = useRef(currentStepIndex);
  const pathnameRef = useRef(pathname);
  const renderStepRef = useRef<((idx: number) => Promise<void>) | null>(null);
  const onTourEndRef = useRef(onTourEnd);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    pathnameRef.current = pathname;
    if (!isActive || !driverRef.current) return;
    const step = steps[currentStepIndexRef.current];
    if (!step?.targetTourId) return;

    const timer = setTimeout(() => {
      if (!driverRef.current) return;
      const el = document.querySelector<HTMLElement>(
        `[data-tour-id="${step.targetTourId}"]`
      );
      if (el) {
        driverRef.current.refresh();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname, isActive, steps]);

  useEffect(() => {
    onTourEndRef.current = onTourEnd;
  }, [onTourEnd]);

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setIsActive(false);
    onTourEndRef.current?.();
  }, []);

  const handleSkip = useCallback(async () => {
    const currentStep = steps[currentStepIndexRef.current];
    stopTour();
    toast.info(t("skippedToast"));
    try {
      await skipOnboardingTourAction({ stepId: currentStep?.id });
    } catch {
      // Optimistic persistence
    }
  }, [steps, stopTour, t]);

  const handleFinish = useCallback(async () => {
    const lastStep = steps[steps.length - 1];
    stopTour();
    toast.success(t("completedToast"));
    try {
      await updateOnboardingStepAction({
        stepId: lastStep?.id ?? "completed",
        status: "completed",
      });
    } catch {
      // Optimistic persistence
    }
    router.push(`/partner/${houseSlug}`);
    setTimeout(() => {
      const checklistCard = document.querySelector('[data-tour-id="tour-checklist-card"]');
      checklistCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }, [steps, stopTour, router, houseSlug, t]);

  const renderStep = useCallback(
    async (stepIdx: number) => {
      if (stepIdx < 0 || stepIdx >= steps.length) return;
      const step = steps[stepIdx];
      setActiveStepIndex(stepIdx);

      // Hide previous spotlight immediately before starting async route/DOM transition
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      updateOnboardingStepAction({
        stepId: step.id,
        status: "in_progress",
      }).catch(() => {});

      const targetPath = step.route ? `/partner/${houseSlug}${step.route}` : `/partner/${houseSlug}`;
      if (pathnameRef.current !== targetPath) {
        router.push(targetPath);
      }

      const targetEl = await waitForTourElement(step.targetTourId, 8000);

      const { driver } = await import("driver.js");
      await import("@/styles/tour.css");

      const isFirst = stepIdx === 0;
      const isLast = stepIdx === steps.length - 1;
      const nextLabel = isFirst
        ? t("start")
        : isLast
          ? t("finish")
          : step.actionCta ?? t("next");

      const driverObj = driver({
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        popoverClass: "safihub-driver-popover",
        showProgress: true,
        progressText: `${stepIdx + 1} / ${steps.length}`,
        nextBtnText: nextLabel,
        prevBtnText: t("prev"),
        doneBtnText: t("done"),
        allowClose: true,
        onNextClick: () => {
          if (isLast) {
            handleFinish();
          } else {
            renderStepRef.current?.(stepIdx + 1);
          }
        },
        onPrevClick: () => {
          if (stepIdx > 0) {
            renderStepRef.current?.(stepIdx - 1);
          }
        },
        onCloseClick: () => {
          handleSkip();
        },
        onDestroyStarted: () => {
          if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
          }
          setIsActive(false);
        },
        onPopoverRender: (popover) => {
          configureTourPopover({
            popover,
            step,
            isFirst,
            skipLabel: t("skipTour"),
            onSkip: handleSkip,
          });
        },
      });

      driverRef.current = driverObj;
      setIsActive(true);

      const popoverOptions = {
        title: step.title,
        description: step.body,
        showButtons: ["next", "previous", "close"] as ("next" | "previous" | "close")[],
        showProgress: true,
        progressText: `${stepIdx + 1} / ${steps.length}`,
      };

      if (targetEl) {
        driverObj.highlight({
          element: targetEl,
          popover: popoverOptions,
        });
      } else {
        driverObj.highlight({
          popover: popoverOptions,
        });
      }
    },
    [steps, houseSlug, router, handleFinish, handleSkip, t]
  );

  useEffect(() => {
    renderStepRef.current = renderStep;
  }, [renderStep]);

  const startTour = useCallback(
    (fromIdx = 0) => {
      renderStep(fromIdx);
    },
    [renderStep]
  );

  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    isActive,
    currentStepIndex,
    startTour,
    stopTour,
    renderStep,
    handleSkip,
  };
}
