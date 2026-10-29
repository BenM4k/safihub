import type { PopoverDOM } from "driver.js";
import type { TourStepConfig } from "./types";

interface ConfigureTourPopoverOptions {
  popover: PopoverDOM;
  step: TourStepConfig;
  isFirst: boolean;
  skipLabel: string;
  onSkip: () => void;
}

export function configureTourPopover({
  popover,
  step,
  isFirst,
  skipLabel,
  onSkip,
}: ConfigureTourPopoverOptions): void {
  popover.wrapper.setAttribute("role", "dialog");
  popover.wrapper.setAttribute("aria-modal", "true");
  popover.title.id = `safihub-tour-title-${step.id}`;
  popover.description.id = `safihub-tour-desc-${step.id}`;
  popover.wrapper.setAttribute("aria-labelledby", popover.title.id);
  popover.wrapper.setAttribute("aria-describedby", popover.description.id);

  setTimeout(() => {
    (popover.nextButton || popover.closeButton)?.focus();
  }, 50);

  if (isFirst && popover.previousButton) {
    popover.previousButton.style.display = "none";
  }

  if (popover.footer && !popover.footer.querySelector(".safihub-tour-skip-btn")) {
    const skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "safihub-tour-skip-btn";
    skipBtn.textContent = skipLabel;
    skipBtn.onclick = (e) => {
      e.preventDefault();
      onSkip();
    };
    popover.footer.prepend(skipBtn);
  }
}

export function resolveInitialStepIndex(
  steps: TourStepConfig[],
  initialStepId?: string | null
): number {
  if (!initialStepId) return 0;
  const idx = steps.findIndex((s) => s.id === initialStepId);
  return idx >= 0 ? idx : 0;
}

