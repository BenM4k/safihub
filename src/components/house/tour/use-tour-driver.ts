"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  updateOnboardingStepAction,
  skipOnboardingTourAction,
} from "@/actions/partner-onboarding.actions";
import { waitForTourElement } from "./dom-waiter";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (!initialStepId) return 0;
    const idx = steps.findIndex((s) => s.id === initialStepId);
    return idx >= 0 ? idx : 0;
  });

  const driverRef = useRef<Driver | null>(null);
  const isNavigatingRef = useRef(false);
  const renderStepRef = useRef<((idx: number) => Promise<void>) | null>(null);

  // Stop / Destroy driver overlay
  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setIsActive(false);
    onTourEnd?.();
  }, [onTourEnd]);

  // Handle skip
  const handleSkip = useCallback(async () => {
    const currentStep = steps[currentStepIndex];
    stopTour();
    toast.info("Visite ignorée. Vous pouvez la revoir depuis Aide.");
    try {
      await skipOnboardingTourAction({ stepId: currentStep?.id });
    } catch {
      // Optimistic persistence
    }
  }, [steps, currentStepIndex, stopTour]);

  // Handle tour completion
  const handleFinish = useCallback(async () => {
    const lastStep = steps[steps.length - 1];
    stopTour();
    toast.success("Visite terminée ! Vous pouvez maintenant compléter votre pressing.");
    try {
      await updateOnboardingStepAction({
        stepId: lastStep?.id ?? "completed",
        status: "completed",
      });
    } catch {
      // Optimistic persistence
    }
    // Return to dashboard and scroll to checklist
    router.push(`/partner/${houseSlug}`);
    setTimeout(() => {
      const checklistCard = document.querySelector('[data-tour-id="tour-checklist-card"]');
      checklistCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }, [steps, stopTour, router, houseSlug]);

  // Render a specific step by index
  const renderStep = useCallback(
    async (stepIdx: number) => {
      if (stepIdx < 0 || stepIdx >= steps.length) return;
      const step = steps[stepIdx];
      setCurrentStepIndex(stepIdx);

      // Persist step progress to server
      updateOnboardingStepAction({
        stepId: step.id,
        status: "in_progress",
      }).catch(() => {});

      // Check if target route is different from current route
      const targetPath = step.route ? `/partner/${houseSlug}${step.route}` : `/partner/${houseSlug}`;
      if (pathname !== targetPath) {
        isNavigatingRef.current = true;
        router.push(targetPath);
      }

      // Wait for target element or fallback
      const targetEl = await waitForTourElement(step.targetTourId, 3000);

      // Lazy-load driver.js and styles
      const { driver } = await import("driver.js");
      await import("@/styles/tour.css");

      const isFirst = stepIdx === 0;
      const isLast = stepIdx === steps.length - 1;

      const nextLabel = isFirst
        ? "Commencer"
        : isLast
          ? "Terminer"
          : step.actionCta ?? "Suivant";

      // Configure driver instance
      const driverObj = driver({
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        popoverClass: "safihub-driver-popover",
        showProgress: true,
        progressText: `${stepIdx + 1} / ${steps.length}`,
        nextBtnText: nextLabel,
        prevBtnText: "Précédent",
        doneBtnText: "Terminer",
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
          setIsActive(false);
        },
        onPopoverRender: (popover) => {
          // Accessibility setup
          popover.wrapper.setAttribute("role", "dialog");
          popover.wrapper.setAttribute("aria-modal", "true");
          popover.title.id = `safihub-tour-title-${step.id}`;
          popover.description.id = `safihub-tour-desc-${step.id}`;
          popover.wrapper.setAttribute("aria-labelledby", popover.title.id);
          popover.wrapper.setAttribute("aria-describedby", popover.description.id);

          // Focus first interactive element inside popover
          setTimeout(() => {
            (popover.nextButton || popover.closeButton)?.focus();
          }, 50);

          // Hide previous button on first step
          if (isFirst && popover.previousButton) {
            popover.previousButton.style.display = "none";
          }

          // Append "Passer la visite" link into footer
          if (popover.footer && !popover.footer.querySelector(".safihub-tour-skip-btn")) {
            const skipBtn = document.createElement("button");
            skipBtn.type = "button";
            skipBtn.className = "safihub-tour-skip-btn";
            skipBtn.textContent = "Passer la visite";
            skipBtn.onclick = (e) => {
              e.preventDefault();
              handleSkip();
            };
            popover.footer.prepend(skipBtn);
          }
        },
      });

      driverRef.current = driverObj;
      setIsActive(true);

      // Highlight target element or centered popover
      if (targetEl) {
        driverObj.highlight({
          element: targetEl,
          popover: {
            title: step.title,
            description: step.body,
          },
        });
      } else {
        driverObj.highlight({
          popover: {
            title: step.title,
            description: step.body,
          },
        });
      }
    },
    [steps, houseSlug, pathname, router, handleFinish, handleSkip]
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
