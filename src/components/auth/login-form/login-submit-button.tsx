"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button
      type="submit"
      variant="primary"
      size="pill"
      disabled={pending}
      className="w-full text-base font-semibold shadow-xs transition-transform"
    >
      {pending ? t("signingIn") : t("continueWithEmail")}
    </Button>
  );
}
