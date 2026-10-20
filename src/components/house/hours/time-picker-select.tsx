"use client";

import { useId } from "react";
import { generateTimeOptions } from "@/lib/hours-utils";

interface TimePickerSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  stepMinutes?: number;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function TimePickerSelect({
  value,
  onChange,
  label,
  stepMinutes = 30,
  disabled = false,
  error = false,
  id: customId,
}: TimePickerSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const options = generateTimeOptions(stepMinutes);

  // If current value is not in generated list (e.g., custom minutes like 17:50), include it
  const selectOptions = options.includes(value)
    ? options
    : [...options, value].sort();

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`h-11 sm:h-9 px-3 rounded-lg border font-mono text-xs sm:text-sm font-semibold transition-colors bg-card text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-primary/20 ${
          error
            ? "border-destructive focus:border-destructive text-destructive"
            : "border-border hover:border-border-strong focus:border-primary"
        }`}
      >
        {selectOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
