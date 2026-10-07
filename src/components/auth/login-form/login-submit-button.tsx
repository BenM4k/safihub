"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="pill"
      disabled={pending}
      className="w-full text-base font-semibold shadow-xs transition-transform"
    >
      {pending ? "Continuing..." : "Continue"}
    </Button>
  );
}
