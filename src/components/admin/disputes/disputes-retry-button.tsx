"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputesRetryButtonProps {
  label: string;
}

export function DisputesRetryButton({ label }: DisputesRetryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
      className="gap-1.5"
    >
      <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
      <span>{label}</span>
    </Button>
  );
}
