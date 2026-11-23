"use client";

import * as React from "react";
import {
  Dialog as UiDialog,
  DialogBackdrop,
  DialogClose as UiDialogClose,
  DialogContent as UiDialogContent,
  DialogDescription as UiDialogDescription,
  DialogTitle as UiDialogTitle,
  DialogTrigger as UiDialogTrigger,
} from "@ui-sdk/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Sheet(props: React.ComponentProps<typeof UiDialog>) {
  return <UiDialog {...props} />;
}

function SheetTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiDialogTrigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiDialogTrigger render={children} {...props} />;
  }
  return <UiDialogTrigger {...props}>{children}</UiDialogTrigger>;
}

function SheetClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof UiDialogClose> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <UiDialogClose render={children} {...props} />;
  }
  return <UiDialogClose {...props}>{children}</UiDialogClose>;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogBackdrop>) {
  return (
    <DialogBackdrop
      className={cn(
        "fixed inset-0 z-50 m-0 h-dvh w-screen max-h-none max-w-none border-0 p-0 bg-black/50 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: Omit<React.ComponentProps<typeof UiDialogContent>, "children"> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SheetOverlay />
      <UiDialogContent
        className={cn(
          "fixed z-50 m-0 flex flex-col gap-4 bg-background shadow-lg transition-transform duration-300 ease-in-out",
          side === "right" &&
            "inset-y-0 right-0 left-auto h-dvh max-h-none w-3/4 border-l data-starting-style:translate-x-full data-ending-style:translate-x-full sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 right-auto h-dvh max-h-none w-3/4 border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 bottom-auto h-auto w-screen max-w-none border-b data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
          side === "bottom" &&
            "inset-x-0 bottom-0 top-auto h-auto w-screen max-w-none border-t data-starting-style:translate-y-full data-ending-style:translate-y-full",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <UiDialogClose
            aria-label="Close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-open:bg-secondary"
          >
            <XIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </UiDialogClose>
        )}
      </UiDialogContent>
    </>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiDialogTitle>) {
  return (
    <UiDialogTitle
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof UiDialogDescription>) {
  return (
    <UiDialogDescription
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
