"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface RegisterSubmitButtonProps {
  isDisabled?: boolean;
  isPending?: boolean;
}

export function RegisterSubmitButton({
  isDisabled,
  isPending,
}: RegisterSubmitButtonProps) {
  const formStatus = useFormStatus();
  const pending = isPending ?? formStatus.pending;
  const t = useTranslations("auth");

  return (
    <Button
      type="submit"
      variant="primary"
      size="pill"
      disabled={pending || isDisabled}
      className="w-full text-base font-semibold shadow-xs disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:opacity-100"
    >
      {pending ? (
        <>
          <Spinner className="mr-2" data-icon="inline-start" />
          {t("registering")}
        </>
      ) : (
        t("signUp")
      )}
    </Button>
  );
}
