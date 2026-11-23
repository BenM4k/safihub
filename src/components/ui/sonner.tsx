"use client";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  toast,
} from "@ui-sdk/react/toast";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ToasterProps = {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  className?: string;
};

const positionClasses: Record<NonNullable<ToasterProps["position"]>, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

function ToastTypeIcon({ type }: { type?: string }) {
  switch (type) {
    case "success":
      return (
        <CircleCheckIcon
          className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        />
      );
    case "error":
      return (
        <OctagonXIcon
          className="size-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
      );
    case "warning":
      return (
        <TriangleAlertIcon
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
      );
    case "loading":
      return (
        <Loader2Icon
          className="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      );
    default:
      return (
        <InfoIcon
          className="size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
      );
  }
}

export function Toaster({
  position = "bottom-center",
  className,
}: ToasterProps) {
  const t = useTranslations("common");

  return (
    <ToastRegion
      className={cn(
        "fixed z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2 pointer-events-none",
        positionClasses[position],
        className
      )}
    >
      {(item) => (
        <Toast
          className={cn(
            "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-[var(--radius)] border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg transition-[opacity,transform] duration-200 data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:translate-y-2 data-ending-style:opacity-0"
          )}
        >
          <ToastTypeIcon type={item.type} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle className="font-semibold leading-snug text-heading" />
            <ToastDescription className="text-xs text-muted-foreground" />
          </div>
          <ToastAction className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-hover" />
          <ToastClose
            aria-label={t("closeNotification")}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </ToastClose>
        </Toast>
      )}
    </ToastRegion>
  );
}

export { toast };
