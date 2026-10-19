"use client";

import { useState, useRef } from "react";
import { roundToStep } from "./catalogue-helpers";
import { DEFAULT_PRICING_BOUNDS, type PricingBoundsConfig } from "./types";

interface PriceFieldInputProps {
  price: number | null;
  initialPrice: number;
  bounds?: PricingBoundsConfig;
  ariaLabel: string;
  onCommitPrice: (price: number) => void;
  onRevertPrice: () => void;
  onKeyDownNavigation?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PriceFieldInput({
  price,
  initialPrice,
  bounds = DEFAULT_PRICING_BOUNDS,
  ariaLabel,
  onCommitPrice,
  onRevertPrice,
  onKeyDownNavigation,
}: PriceFieldInputProps) {
  const [localValue, setLocalValue] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived display value: if currently editing, use localValue; otherwise format price
  const displayString =
    localValue !== null
      ? localValue
      : price && price > 0
      ? parseInt(String(price), 10).toLocaleString("fr-FR")
      : "";

  function handleBlur() {
    if (localValue === null) return;
    const raw = parseInt(localValue.replace(/\s+/g, ""), 10);
    setLocalValue(null);

    if (isNaN(raw) || raw <= 0) {
      const fallback = initialPrice > 0 ? initialPrice : 1000;
      onCommitPrice(fallback);
      return;
    }

    const rounded = Math.max(bounds.minPrice, roundToStep(raw, bounds.step));
    onCommitPrice(rounded);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setLocalValue(null);
      onRevertPrice();
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (onKeyDownNavigation) {
      onKeyDownNavigation(e);
    }
  }

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayString}
        onChange={(e) => {
          const numericOnly = e.target.value.replace(/[^0-9]/g, "");
          setLocalValue(numericOnly);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="0"
        aria-label={ariaLabel}
        className="w-full h-8 pl-2 pr-11 text-right font-mono font-bold text-xs bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-heading [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span
        className="absolute right-2 text-[11px] text-muted-foreground font-semibold pointer-events-none select-none"
        aria-hidden="true"
      >
        CDF
      </span>
    </div>
  );
}
