"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmPasswordFieldProps {
  error?: string;
  value: string;
  onChange: (val: string) => void;
}

export function ConfirmPasswordField({
  error,
  value,
  onChange,
}: ConfirmPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor="confirmPassword"
        className="text-xs sm:text-sm font-semibold"
      >
        Retype your password <span className="text-red-500">*</span>
      </Label>

      <div className="relative">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Retype your password"
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          hasError={Boolean(error)}
          className="pr-10"
          aria-describedby={error ? "confirm-error" : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      {error && (
        <p id="confirm-error" className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
