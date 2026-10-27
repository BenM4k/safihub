"use client";

import { useId } from "react";
import { generateTimeOptions } from "@/lib/hours-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={selectId}
        aria-label={label}
        className={cn(
          "h-10 sm:h-9 px-3 font-mono text-base sm:text-sm font-semibold w-26 sm:w-28 rounded-xl",
          error && "border-destructive text-destructive"
        )}
      >
        <SelectValue placeholder={value} />
      </SelectTrigger>
      <SelectContent className="max-h-56">
        {selectOptions.map((opt) => (
          <SelectItem key={opt} value={opt} className="font-mono text-xs sm:text-sm">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
