"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

interface RegisterSubmitButtonProps {
  isDisabled?: boolean;
}

export function RegisterSubmitButton({ isDisabled }: RegisterSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="pill"
      disabled={pending || isDisabled}
      className="w-full text-base font-semibold shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-100"
    >
      {pending ? "Creating account..." : "Continue"}
    </Button>
  );
}
